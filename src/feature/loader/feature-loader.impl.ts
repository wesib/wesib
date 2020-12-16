import { ContextValueSlot } from '@proc7ts/context-values';
import { ContextUpKey } from '@proc7ts/context-values/updatable';
import {
  afterAll,
  afterEach,
  AfterEvent,
  afterEventBy,
  afterThe,
  digAfter_,
  EventKeeper,
  mapAfter,
  mapAfter_,
  shareAfter,
  trackValue,
  translateAfter,
  translateAfter_,
} from '@proc7ts/fun-events';
import { Class, isPresent, setOfElements } from '@proc7ts/primitives';
import { BootstrapContext } from '../../boot';
import { FeatureContext } from '../feature-context';
import { FeatureContext$ } from './feature-context.impl';
import { FeatureClause, FeatureRequest } from './feature-request.impl';

const FeatureKey__symbol = (/*#__PURE__*/ Symbol('feature-key'));

interface FeatureClass extends Class {
  [FeatureKey__symbol]?: FeatureKey;
}

/**
 * @internal
 */
export class FeatureKey extends ContextUpKey<AfterEvent<[FeatureLoader?]>, FeatureClause> {

  static of(feature: Class): FeatureKey {
    // eslint-disable-next-line no-prototype-builtins
    return feature.hasOwnProperty(FeatureKey__symbol)
        ? ((feature as FeatureClass)[FeatureKey__symbol] as FeatureKey)
        : ((feature as FeatureClass)[FeatureKey__symbol] = new FeatureKey(feature));
  }

  get upKey(): this {
    return this;
  }

  private constructor(feature: Class) {
    super(`feature:${feature.name}`);
  }

  grow(
      slot: ContextValueSlot<
          AfterEvent<[FeatureLoader?]>,
          EventKeeper<FeatureClause[]> | FeatureClause,
          AfterEvent<FeatureClause[]>>,
  ): void {
    slot.insert(loadFeature(
        slot.context.get(BootstrapContext),
        slot.seed.do(mapAfter(preferredFeatureClause)),
    ));
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
    let source: AfterEvent<[FeatureLoader?]> = afterThe();
    let stageId: Promise<FeatureStageId> = Promise.resolve('idle');

    return afterAll({
      clause: from,
      deps: loadFeatureDeps(bsContext, from),
    }).do(digAfter_(({ clause: [clause], deps }): AfterEvent<[FeatureLoader?]> => {
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
        return source = bsContext.get(FeatureKey.of(origin)).do(mapAfter_(
            loader => {
              if (loader) {
                loader.to(stageId);
                stageId = loader.stage;
              }
              return loader;
            },
        ));
      }

      // Create feature's own loader
      const ownLoader = new FeatureLoader(bsContext, request, deps).to(stageId);
      const ownSource = afterThe(ownLoader);

      return source = afterEventBy<[FeatureLoader]>(
          rcv => ownSource(rcv).whenOff(() => {
            stageId = ownLoader.unload();
          }),
      ).do(shareAfter); // Can be accessed again when reused
    }))(receiver);
  }).do(
      translateAfter(preventDuplicateLoader()),
  );
}

function preventDuplicateLoader():
    (
        send: (loader?: FeatureLoader) => void,
        loader?: FeatureLoader,
    ) => void {

  let lastLoader: FeatureLoader | null | undefined = null; // Initially `null` to differ from `undefined`

  return (send, loader?: FeatureLoader): void => {
    if (lastLoader !== loader) {
      lastLoader = loader;

      if (loader) {
        send(loader);
      } else {
        send();
      }
    }
  };
}

function loadFeatureDeps(
    bsContext: BootstrapContext,
    from: AfterEvent<[FeatureClause?]>,
): AfterEvent<FeatureLoader[]> {
  return from.do(digAfter_(clause => {
    if (!clause) {
      return afterThe();
    }

    const [{ def }] = clause;
    const needs = setOfElements(def.needs);

    if (!needs.size) {
      return afterThe();
    }

    return afterEach(
        ...[...needs].map(dep => bsContext.get(FeatureKey.of(dep))),
    ).do(
        translateAfter_(presentFeatureDeps),
    );
  }));
}

function presentFeatureDeps(send: (...loaders: FeatureLoader[]) => void, ...deps: [FeatureLoader?][]): void {
  return send(...deps.map(([dep]) => dep).filter(isPresent));
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

    // Unloaded feature should never be accessed again.
    delete (this as unknown as { _stage?: Promise<FeatureStage> })._stage;

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
    const context = new FeatureContext$(bsContext, this.loader);
    const supply = context.supply;

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
