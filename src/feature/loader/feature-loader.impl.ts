import { filterIt, mapIt } from 'a-iterable';
import { isPresent, NextArgs, nextArgs } from 'call-thru';
import { ContextRegistry, ContextUpKey, ContextValueOpts, ContextValues, ContextValueSpec } from 'context-values';
import { AfterEvent, afterEventBy, afterEventFromAll, afterEventFromEach, afterEventOf, EventKeeper } from 'fun-events';
import { BootstrapContext } from '../../boot';
import { BootstrapValueRegistry } from '../../boot/bootstrap/bootstrap-value-registry.impl';
import { ComponentRegistry } from '../../boot/definition/component-registry.impl';
import { ComponentValueRegistry } from '../../boot/definition/component-value-registry.impl';
import { DefinitionValueRegistry } from '../../boot/definition/definition-value-registry.impl';
import { ArraySet, Class } from '../../common';
import { ComponentContext } from '../../component';
import { ComponentClass, DefinitionContext } from '../../component/definition';
import { FeatureContext } from '../feature-context';
import { FeatureClause, FeatureRequest } from './feature-request.impl';

/**
 * @internal
 */
export interface FeatureLoader {

  readonly request: FeatureRequest;

  readonly ready: Promise<void>;

  readonly down: Promise<void>;

  setup(): Promise<void>;

  init(): Promise<void>;

}

const FeatureKey__symbol = /*#__PURE__*/ Symbol('feature-key');

/**
 * @internal
 */
export class FeatureKey extends ContextUpKey<AfterEvent<[FeatureLoader?]>, FeatureClause> {

  static of(feature: Class): FeatureKey {

    const feat = feature as any;

    return feat[FeatureKey__symbol] || (feat[FeatureKey__symbol] = new FeatureKey(feature));
  }

  private constructor(feature: Class) {
    super(`feature:${feature.name}`);
  }

  grow<Ctx extends ContextValues>(
      opts: ContextValueOpts<
          Ctx,
          AfterEvent<[FeatureLoader?]>,
          EventKeeper<FeatureClause[]> | FeatureClause,
          AfterEvent<FeatureClause[]>>,
  ): AfterEvent<[FeatureLoader?]> | null | undefined {
    return loadFeature(
        opts.context.get(BootstrapContext),
        opts.seed.keep.thru(preferredFeatureClause),
    );
  }

}

function preferredFeatureClause(...clauses: FeatureClause[]): FeatureClause | undefined {

  let required = false;
  let preferred: FeatureClause | undefined;

  for (const clause of clauses) {
    switch (clause[1]) {
      case 'is':
        required = true;
        if (!preferred) {
          preferred = clause;
        }
        break;
      case 'has':
        preferred = clause;
        break;
      case 'needs':
        required = true;
    }
  }

  return required ? preferred : undefined;
}

function loadFeature(
    bsContext: BootstrapContext,
    from: AfterEvent<[FeatureClause?]>,
): AfterEvent<[FeatureLoader?]> {
  return afterEventBy<[FeatureLoader?]>(receiver => {

    let lastUnload = Promise.resolve();
    let lastCommand: 'setup' | 'init' | undefined;
    let state: FeatureState | undefined;

    return afterEventFromAll({
      clause: from,
      deps: loadFeatureDeps(bsContext, from),
    }).thru_(({ clause: [clause], deps }) => {
      if (!clause) {
        unload(); // Feature is no longer required. Unload it.
        return;
      }
      if (state) {
        if (clause[0].feature === state.request.feature) {
          return state; // Implemented by the same feature. Do not change it.
        }
        unload(); // Implemented by another feature. Unload the previous one.
      }

      return state = new FeatureState(
          bsContext,
          clause[0],
          deps,
          lastUnload,
          lastCommand,
      );
    })(receiver).whenDone(() => {
      unload(); // Unload the feature once there is no more receivers
    });

    function unload() {
      if (state) {
        lastUnload = state.unload();
        lastCommand = state.command;
        state = undefined;
      }
    }
  }).share();
}

function loadFeatureDeps(
    bsContext: BootstrapContext,
    from: AfterEvent<[FeatureClause?]>,
): AfterEvent<FeatureLoader[]> {
  return from.keep.dig_(clause => {
    if (!clause) {
      return afterEventOf();
    }

    const [{ def }] = clause;
    const needs = new ArraySet(def.needs);

    if (!needs.size) {
      return afterEventOf();
    }

    return afterEventFromEach(...needs.map(dep => bsContext.get(FeatureKey.of(dep))))
        .keep.thru_(presentFeatureDeps);
  });
}

function presentFeatureDeps<NextReturn>(...deps: [FeatureLoader?][]): NextArgs<FeatureLoader[], NextReturn> {
  return nextArgs<FeatureLoader[], NextReturn>(
      ...filterIt<FeatureLoader | undefined, FeatureLoader>(
          mapIt(deps, dep => dep[0]),
          isPresent,
      )
  );
}

class FeatureState implements FeatureLoader {

  readonly down: Promise<void>;
  private _stage: Promise<FeatureStage>;
  private _down!: () => void;

  constructor(
      readonly bsContext: BootstrapContext,
      readonly request: FeatureRequest,
      readonly deps: FeatureLoader[],
      prepare: Promise<void>,
      public command: 'setup' | 'init' | undefined,
  ) {
    this.down = new Promise(resolve => this._down = resolve);
    this._stage = prepare.then(() => new SetupFeatureStage(this))
        .then(stage => command ? stage[command]() : stage);
  }

  get ready() {
    return this._stage as Promise<any>;
  }

  async setup(): Promise<void> {
    this.command = 'setup';
    await (this._stage = this._stage.then(stage => stage.setup()));
  }

  async init(): Promise<void> {
    this.command = 'init';
    await (this._stage = this._stage.then(stage => stage.init()));
  }

  async unload(): Promise<void> {

    const prevStage = this._stage;

    delete this._stage; // Unloaded feature should never be accessed again.

    await prevStage.then(stage => stage.unload()).then(this._down);
  }

}

interface FeatureStage {

  readonly unload: () => Promise<void>;

  setup(): Promise<FeatureStage>;

  init(): Promise<FeatureStage>;

}

abstract class BaseFeatureStage implements FeatureStage {

  constructor(
      readonly state: FeatureState,
      readonly unload: () => Promise<void> = () => Promise.resolve(),
  ) {}

  abstract setup(): Promise<FeatureStage>;

  abstract init(): Promise<FeatureStage>;

  protected perDep(action: (dep: FeatureLoader) => Promise<void>): Promise<any> {

    const { deps } = this.state;

    return Promise.all(deps.map(dep => action(dep)));
  }

}

class SetupFeatureStage extends BaseFeatureStage {

  async setup(): Promise<FeatureStage> {
    await this.perDep(loader => loader.setup());

    const { bsContext, request: { def: { set, perDefinition, perComponent } } } = this.state;
    const [context, unloads] = newFeatureContext(bsContext);
    const bootstrapValueRegistry = bsContext.get(BootstrapValueRegistry);

    new ArraySet(set).forEach(spec => unloads.push(bootstrapValueRegistry.provide(spec)));
    new ArraySet(perDefinition).forEach(spec => context.perDefinition(spec));
    new ArraySet(perComponent).forEach(spec => context.perComponent(spec));

    return new InitFeatureStage(
        this.state,
        context,
        async () => unloads.forEach(unload => unload()),
    );
  }

  init(): Promise<FeatureStage> {
    return this.setup().then(stage => stage.init());
  }

}

class InitFeatureStage extends BaseFeatureStage {

  constructor(
      state: FeatureState,
      private readonly _context: FeatureContext,
      unload: () => Promise<void>,
  ) {
    super(state, unload);
  }

  async setup(): Promise<FeatureStage> {
    return this;
  }

  async init(): Promise<FeatureStage> {
    await this.perDep(loader => loader.init());

    const { request: { feature, def: { init } } } = this.state;

    if (init) {
      init.call(feature, this._context);
    }

    return new ActiveFeatureStage(this);
  }

}

class ActiveFeatureStage extends BaseFeatureStage {

  constructor(prev: InitFeatureStage) {
    super(prev.state, prev.unload);
  }

  async setup(): Promise<FeatureStage> {
    return this;
  }

  async init(): Promise<FeatureStage> {
    return this;
  }

}

function newFeatureContext(bsContext: BootstrapContext): [FeatureContext, (() => void)[]] {

  const unloads: (() => void)[] = [];
  const componentRegistry = bsContext.get(ComponentRegistry);
  const definitionValueRegistry = bsContext.get(DefinitionValueRegistry);
  const componentValueRegistry = bsContext.get(ComponentValueRegistry);
  const registry = new ContextRegistry<FeatureContext>(bsContext);
  const values = registry.newValues();

  class Context extends FeatureContext {

    constructor() {
      super();
      registry.provide({ a: FeatureContext, is: this });
    }

    get get() {
      return values.get;
    }

    perDefinition<D extends any[], S>(spec: ContextValueSpec<DefinitionContext, any, D, S>) {

      const unload = definitionValueRegistry.provide(spec);

      unloads.push(unload);

      return unload;
    }

    perComponent<D extends any[], S>(spec: ContextValueSpec<ComponentContext, any, D, S>) {

      const unload = componentValueRegistry.provide(spec);

      unloads.push(unload);

      return unload;
    }

    define<T extends object>(componentType: ComponentClass<T>): void {
      componentRegistry.define(componentType);
    }

  }

  return [new Context(), unloads];
}
