import { filterIt, mapIt } from 'a-iterable';
import { isPresent, NextArgs, nextArgs, nextSkip } from 'call-thru';
import { ContextRegistry, ContextUpKey, ContextValueOpts, ContextValues, ContextValueSpec } from 'context-values';
import {
  AfterEvent,
  afterEventBy,
  afterEventFromAll,
  afterEventFromEach,
  afterEventOf,
  EventKeeper,
  OnEvent,
  trackValue,
} from 'fun-events';
import { BootstrapContext } from '../../boot';
import {
  BootstrapValueRegistry,
  ComponentRegistry,
  ComponentValueRegistry,
  DefinitionValueRegistry,
} from '../../boot/impl';
import { ArraySet, Class } from '../../common';
import { ComponentContext } from '../../component';
import { ComponentClass, DefinitionContext } from '../../component/definition';
import { FeatureContext } from '../feature-context';
import { FeatureClause, FeatureRequest } from './feature-request.impl';

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

    let stageId: Promise<FeatureStageId> = Promise.resolve('idle');
    let loader: FeatureLoader | undefined;

    return afterEventFromAll({
      clause: from,
      deps: loadFeatureDeps(bsContext, from),
    }).thru_(({ clause: [clause], deps }) => {
      if (!clause) {
        unload(); // Feature is no longer required. Unload it.
        return;
      }
      if (loader) {
        if (clause[0].feature === loader.request.feature) {
          return loader; // Implemented by the same feature. Do not change it.
        }
        unload(); // Implemented by another feature. Unload the previous one.
      }

      return loader = new FeatureLoader(bsContext, clause[0], deps).to(stageId);
    })(receiver).whenDone(() => {
      unload(); // Unload the feature once there is no more receivers
    });

    function unload() {
      if (loader) {
        stageId = loader.unload();
        loader = undefined;
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

/**
 * @internal
 */
export class FeatureLoader {

  readonly down: Promise<void>;
  private _stage: Promise<FeatureStage>;
  private _down!: () => void;
  readonly complete = trackValue(false);

  constructor(
      readonly bsContext: BootstrapContext,
      readonly request: FeatureRequest,
      readonly deps: FeatureLoader[],
  ) {
    this.down = new Promise(resolve => this._down = resolve);
    this._stage = Promise.resolve(new SetupFeatureStage(this));
  }

  get ready() {
    return this._stage as Promise<any>;
  }

  get isReady() {
    return this.complete.it;
  }

  to(stageId: Promise<FeatureStageId>): this {

    const lastStage = this._stage;

    this._stage = stageId.then(id => lastStage.then(stage => stage[id]()));

    return this;
  }

  async setup(): Promise<void> {
    await (this._stage = this._stage.then(stage => stage.setup()));
  }

  async init(): Promise<void> {
    await (this._stage = this._stage.then(stage => stage.init()));
  }

  async unload(): Promise<FeatureStageId> {

    const prevStage = this._stage;

    delete this._stage; // Unloaded feature should never be accessed again.

    const stage = await prevStage;
    const stageId = await stage.stop();

    this._down();

    return stageId;
  }

}

type FeatureStageId = 'idle' | 'setup' | 'init';
type FeatureStageStop = (this: void) => Promise<any>;

abstract class FeatureStage {

  protected abstract readonly after: FeatureStageId;

  constructor(
      readonly loader: FeatureLoader,
      private readonly _stop: FeatureStageStop = () => Promise.resolve(),
  ) {}

  async idle(): Promise<this> {
    return this;
  }

  abstract setup(): Promise<FeatureStage>;

  abstract init(): Promise<FeatureStage>;

  stop(): Promise<FeatureStageId> {
    return this._stop().then(() => this.after);
  }

  protected perDep(action: (dep: FeatureLoader) => Promise<void>): Promise<any> {

    const { deps } = this.loader;

    return Promise.all(deps.map(dep => action(dep)));
  }

}

class SetupFeatureStage extends FeatureStage {

  protected get after(): FeatureStageId {
    return 'idle';
  }

  async setup(): Promise<FeatureStage> {
    await this.perDep(loader => loader.setup());

    const { bsContext, request: { def: { set, perDefinition, perComponent } } } = this.loader;
    const [context, unloads] = newFeatureContext(
        bsContext,
        this.loader.complete.read.thru(
            complete => complete ? nextArgs() : nextSkip(),
        ),
    );
    const bootstrapValueRegistry = bsContext.get(BootstrapValueRegistry);

    new ArraySet(set).forEach(spec => unloads.push(bootstrapValueRegistry.provide(spec)));
    new ArraySet(perDefinition).forEach(spec => context.perDefinition(spec));
    new ArraySet(perComponent).forEach(spec => context.perComponent(spec));

    return new InitFeatureStage(
        this.loader,
        context,
        async () => unloads.forEach(unload => unload()),
    );
  }

  init(): Promise<FeatureStage> {
    return this.setup().then(stage => stage.init());
  }

}

class InitFeatureStage extends FeatureStage {

  protected get after(): FeatureStageId {
    return 'setup';
  }

  constructor(
      state: FeatureLoader,
      private readonly _context: FeatureContext,
      stop: FeatureStageStop,
  ) {
    super(state, stop);
  }

  async setup(): Promise<FeatureStage> {
    return this;
  }

  async init(): Promise<FeatureStage> {
    await this.perDep(loader => loader.init());

    const { request: { feature, def: { init } } } = this.loader;

    if (init) {
      init.call(feature, this._context);
    }

    return new ActiveFeatureStage(this);
  }

}

class ActiveFeatureStage extends FeatureStage {

  protected get after(): FeatureStageId {
    return 'init';
  }

  constructor(prev: InitFeatureStage) {
    super(prev.loader, () => prev.stop());
    prev.loader.complete.it = true;
  }

  async setup(): Promise<FeatureStage> {
    return this;
  }

  async init(): Promise<FeatureStage> {
    return this;
  }

}

function newFeatureContext(
    bsContext: BootstrapContext,
    whenReady: OnEvent<[]>,
): [FeatureContext, (() => void)[]] {

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

    whenReady(callback: (this: void) => void): void {
      bsContext.whenReady(() => {
        whenReady.once(callback);
      });
    }

  }

  return [new Context(), unloads];
}
