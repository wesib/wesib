import { ContextRegistry, ContextValueSpec } from '@proc7ts/context-values';
import { ContextModule } from '@proc7ts/context-values/updatable';
import { onceOn, OnEvent, supplyOn, valueOn_ } from '@proc7ts/fun-events';
import { Class, Supply } from '@proc7ts/primitives';
import { BootstrapContext } from '../../boot';
import {
  BootstrapContextRegistry,
  ElementBuilder,
  onPostDefSetup,
  PerComponentRegistry,
  PerDefinitionRegistry,
} from '../../boot/impl';
import { ComponentContext } from '../../component';
import { ComponentClass, DefinitionContext, DefinitionSetup } from '../../component/definition';
import { FeatureContext } from '../feature-context';
import { ComponentRegistry } from './component-registry.impl';

/**
 * @internal
 */
export class FeatureContext$ extends FeatureContext {

  readonly whenReady: OnEvent<[FeatureContext]>;
  private _onDefinition?: OnEvent<[DefinitionContext]>;
  private _onComponent?: OnEvent<[ComponentContext]>;
  readonly get: FeatureContext['get'];
  private readonly _bsContext: BootstrapContext;
  private readonly _componentRegistry: ComponentRegistry;

  constructor(readonly feature: Class, private readonly _setup: ContextModule.Setup) {
    super();

    this._bsContext = _setup.get(BootstrapContext);

    const handle = _setup.get(_setup.module);
    const registry = new ContextRegistry<FeatureContext>(this._bsContext);

    registry.provide({ a: FeatureContext, is: this });
    this.get = registry.newValues().get;

    this.whenReady = handle.read.do(
        valueOn_(({ ready }) => ready && this),
        onceOn,
    );

    this._componentRegistry = new ComponentRegistry(this._setup);
  }

  get supply(): Supply {
    return this._setup.supply;
  }

  get onDefinition(): OnEvent<[DefinitionContext]> {
    return this._onDefinition
        || (this._onDefinition = this._setup.get(ElementBuilder).definitions.on.do(supplyOn(this)));
  }

  get onComponent(): OnEvent<[ComponentContext]> {
    return this._onComponent
        || (this._onComponent = this._setup.get(ElementBuilder).components.on.do(supplyOn(this)));
  }

  provide<TSrc, TDeps extends any[]>(
      spec: ContextValueSpec<BootstrapContext, unknown, TSrc, TDeps>,
  ): Supply {
    return this._bsContext.get(BootstrapContextRegistry).provide(spec).needs(this);
  }

  perDefinition<TSrc, TDeps extends any[]>(
      spec: ContextValueSpec<DefinitionContext, unknown, TSrc, TDeps>,
  ): Supply {
    return this._bsContext.get(PerDefinitionRegistry).provide(spec).needs(this);
  }

  perComponent<TSrc, TDeps extends any[]>(
      spec: ContextValueSpec<ComponentContext, unknown, TSrc, TDeps>,
  ): Supply {
    return this._bsContext.get(PerComponentRegistry).provide(spec).needs(this);
  }

  setupDefinition<T extends object>(componentType: ComponentClass<T>): OnEvent<[DefinitionSetup]> {
    return onPostDefSetup(componentType, this.supply);
  }

  define<T extends object>(componentType: ComponentClass<T>): void {
    this._componentRegistry.define(componentType);
  }

}
