import { filterIt, mapIt } from 'a-iterable';
import { isPresent, nextArgs, NextCall, NextSkip, nextSkip } from 'call-thru';
import { ContextRegistry, ContextUpKey, ContextValueOpts, ContextValues, ContextValueSpec } from 'context-values';
import {
  afterAll,
  afterEach,
  AfterEvent,
  afterEventBy,
  afterThe,
  EventKeeper,
  EventSupply,
  OnEvent,
  OnEventCallChain,
  trackValue,
} from 'fun-events';
import { BootstrapContext } from '../../boot';
import {
  BootstrapContextRegistry,
  ComponentContextRegistry,
  DefinitionContextRegistry,
  ElementBuilder,
  newUnloader,
  onPostDefSetup,
} from '../../boot/impl';
import { ArraySet, Class } from '../../common';
import { ComponentContext } from '../../component';
import { ComponentClass, DefinitionContext, DefinitionSetup } from '../../component/definition';
import { FeatureContext } from '../feature-context';
import { ComponentRegistry } from './component-registry.impl';
import { FeatureClause, FeatureRequest } from './feature-request.impl';

const FeatureKey__symbol = (/*#__PURE__*/ Symbol('feature-key'));

/**
 * @internal
 */
export class FeatureKey extends ContextUpKey<AfterEvent<[FeatureLoader?]>, FeatureClause> {

  static of(feature: Class): FeatureKey {
    // eslint-disable-next-line no-prototype-builtins
    return feature.hasOwnProperty(FeatureKey__symbol)
        ? (feature as any)[FeatureKey__symbol]
        : ((feature as any)[FeatureKey__symbol] = new FeatureKey(feature));
  }

  get upKey(): this {
    return this;
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

    let origin: Class | undefined;
    let source: OnEvent<[FeatureLoader?]> = afterThe();
    let stageId: Promise<FeatureStageId> = Promise.resolve('idle');

    return afterAll({
      clause: from,
      deps: loadFeatureDeps(bsContext, from),
    }).dig_(({ clause: [clause], deps }) => {
      if (!clause) {
        return afterThe();
      }

      const [request, , target] = clause;

      if (request.feature === origin) {
        return source; // Origin didn't change. Reuse the source.
      }

      origin = request.feature;

      if (target !== origin) {
        // Originated from replacement feature provider. Reuse its loader.
        return source = bsContext.get(FeatureKey.of(origin)).thru_(
            loader => {
              loader!.to(stageId);
              stageId = loader!.stage;
              return loader;
            },
        );
      }

      // Create feature's own loader
      const ownLoader = new FeatureLoader(bsContext, request, deps).to(stageId);
      const ownSource = afterThe(ownLoader);

      return source = afterEventBy<[FeatureLoader]>(
          rcv => ownSource(rcv).whenOff(() => {
            stageId = ownLoader.unload();
          }),
      ).share(); // Can be accessed again when reused
    })(receiver);
  }).keep.thru(
      preventDuplicateLoader(),
  );
}

function preventDuplicateLoader():
    (
        loader?: FeatureLoader,
    ) => NextCall<OnEventCallChain, [FeatureLoader?]> | NextSkip {

  let lastLoader: FeatureLoader | null | undefined = null; // Initially `null` to differ from `undefined`

  return (loader?: FeatureLoader) => {
    if (lastLoader === loader) {
      return nextSkip();
    }
    lastLoader = loader;

    if (!loader) {
      return nextArgs<[FeatureLoader?]>();
    }

    return nextArgs<[FeatureLoader?]>(loader);
  };
}

function loadFeatureDeps(
    bsContext: BootstrapContext,
    from: AfterEvent<[FeatureClause?]>,
): AfterEvent<FeatureLoader[]> {
  return from.keep.dig_(clause => {
    if (!clause) {
      return afterThe();
    }

    const [{ def }] = clause;
    const needs = new ArraySet(def.needs);

    if (!needs.size) {
      return afterThe();
    }

    return afterEach(...needs.map(dep => bsContext.get(FeatureKey.of(dep))))
        .keep.thru_(presentFeatureDeps);
  });
}

function presentFeatureDeps(...deps: [FeatureLoader?][]): NextCall<OnEventCallChain, FeatureLoader[]> {
  return nextArgs<FeatureLoader[]>(
      ...filterIt<FeatureLoader | undefined, FeatureLoader>(
          mapIt(deps, dep => dep[0]),
          isPresent,
      ),
  );
}

/**
 * @internal
 */
export class FeatureLoader {

  readonly down: Promise<void>;
  private _stage: Promise<FeatureStage>;
  private _down!: () => void;
  readonly state = trackValue(false);

  constructor(
      readonly bsContext: BootstrapContext,
      readonly request: FeatureRequest,
      readonly deps: FeatureLoader[],
  ) {
    this.down = new Promise(resolve => this._down = resolve);
    this._stage = Promise.resolve(new SetupFeatureStage(this));
  }

  get stage(): Promise<FeatureStageId> {
    return this._stage.then(stage => stage.after);
  }

  get ready(): boolean {
    return this.state.it;
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

  abstract readonly after: FeatureStageId;

  constructor(
      readonly loader: FeatureLoader,
      private readonly _stop: FeatureStageStop = () => Promise.resolve(),
  ) {}

  idle(): Promise<this> {
    return Promise.resolve(this);
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

  get after(): 'idle' {
    return 'idle';
  }

  async setup(): Promise<FeatureStage> {
    await this.perDep(loader => loader.setup());

    const { bsContext, request: { def } } = this.loader;
    const [context, supply] = newFeatureContext(bsContext, this.loader);

    def.setup?.(context);

    return new InitFeatureStage(
        this.loader,
        context,
        () => Promise.resolve(supply.off()),
    );
  }

  init(): Promise<FeatureStage> {
    return this.setup().then(stage => stage.init());
  }

}

class InitFeatureStage extends FeatureStage {

  get after(): 'setup' {
    return 'setup';
  }

  constructor(
      state: FeatureLoader,
      private readonly _context: FeatureContext,
      stop: FeatureStageStop,
  ) {
    super(state, stop);
  }

  setup(): Promise<FeatureStage> {
    return Promise.resolve(this);
  }

  async init(): Promise<FeatureStage> {
    await this.perDep(loader => loader.init());

    const { request: { def } } = this.loader;

    def.init?.(this._context);

    return new ActiveFeatureStage(this);
  }

}

class ActiveFeatureStage extends FeatureStage {

  get after(): 'init' {
    return 'init';
  }

  constructor(prev: InitFeatureStage) {
    super(prev.loader, () => prev.stop());
    prev.loader.state.it = true;
  }

  setup(): Promise<FeatureStage> {
    return Promise.resolve(this);
  }

  init(): Promise<FeatureStage> {
    return Promise.resolve(this);
  }

}

function newFeatureContext(
    bsContext: BootstrapContext,
    loader: FeatureLoader,
): [FeatureContext, EventSupply] {

  const unloader = newUnloader();
  let componentRegistry: ComponentRegistry;
  const definitionContextRegistry = bsContext.get(DefinitionContextRegistry);
  const componentContextRegistry = bsContext.get(ComponentContextRegistry);
  const registry = new ContextRegistry<FeatureContext>(bsContext);
  const elementBuilder = bsContext.get(ElementBuilder);
  const onDefinition = elementBuilder.definitions.on.tillOff(unloader.supply);
  const onComponent = elementBuilder.components.on.tillOff(unloader.supply);

  class Context extends FeatureContext {

    readonly get = registry.newValues().get;
    readonly whenReady: OnEvent<[FeatureContext]>;

    constructor() {
      super();

      const whenReady: OnEvent<[FeatureContext]> = afterAll({
        st: loader.state,
        bs: trackValue<BootstrapContext>().by(bsContext.whenReady),
      }).thru(
          ({ st: [ready], bs: [bs] }) => bs && ready ? nextArgs(this) : nextSkip(),
      );

      this.whenReady = whenReady.once;
      registry.provide({ a: FeatureContext, is: this });
      componentRegistry = new ComponentRegistry(this);
    }

    get feature(): Class {
      return loader.request.feature;
    }

    get onDefinition(): OnEvent<[DefinitionContext]> {
      return onDefinition;
    }

    get onComponent(): OnEvent<[ComponentContext]> {
      return onComponent;
    }

    provide<Deps extends any[], Src, Seed>(
        spec: ContextValueSpec<BootstrapContext, any, Deps, Src, Seed>,
    ): () => void {
      return unloader.add(() => bsContext.get(BootstrapContextRegistry).provide(spec));
    }

    perDefinition<Deps extends any[], Src, Seed>(
        spec: ContextValueSpec<DefinitionContext, any, Deps, Src, Seed>,
    ): () => void {
      return unloader.add(() => definitionContextRegistry.provide(spec));
    }

    perComponent<Deps extends any[], Src, Seed>(
        spec: ContextValueSpec<ComponentContext, any, Deps, Src, Seed>,
    ): () => void {
      return unloader.add(() => componentContextRegistry.provide(spec));
    }

    setupDefinition<T extends object>(componentType: ComponentClass<T>): OnEvent<[DefinitionSetup]> {
      return onPostDefSetup(componentType, unloader);
    }

    define<T extends object>(componentType: ComponentClass<T>): void {
      componentRegistry.define(componentType);
    }

  }

  return [new Context(), unloader.supply];
}
