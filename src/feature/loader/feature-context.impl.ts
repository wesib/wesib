import { ContextRegistry, ContextValueSpec } from '@proc7ts/context-values';
import { afterAll, onceOn, OnEvent, supplyOn, trackValue, valueOn } from '@proc7ts/fun-events';
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
import { FeatureLoader } from './feature-loader.impl';

/**
 * @internal
 */
export class FeatureContext$ extends FeatureContext {

  readonly whenReady: OnEvent<[FeatureContext]>;
  readonly onDefinition: OnEvent<[DefinitionContext]>;
  readonly onComponent: OnEvent<[ComponentContext]>;
  readonly supply = new Supply();
  readonly get: FeatureContext['get'];
  private readonly _componentRegistry: ComponentRegistry;

  constructor(
      private readonly _bsContext: BootstrapContext,
      private readonly _loader: FeatureLoader,
  ) {
    super();

    const registry = new ContextRegistry<FeatureContext>(_bsContext);

    registry.provide({ a: FeatureContext, is: this });
    this.get = registry.newValues().get;

    this.whenReady = afterAll({
      st: this._loader.state,
      bs: trackValue<BootstrapContext>().by(_bsContext.whenReady),
    }).do(
        valueOn(({ st: [ready], bs: [bs] }) => bs && ready && this),
        onceOn,
    );
    this.onDefinition = _bsContext.get(ElementBuilder).definitions.on.do(supplyOn(this));
    this.onComponent = this._bsContext.get(ElementBuilder).components.on.do(supplyOn(this));

    this._componentRegistry = new ComponentRegistry(this);
  }

  get feature(): Class {
    return this._loader.request.feature;
  }

  provide<TDeps extends any[], TSrc, TSeed>(
      spec: ContextValueSpec<BootstrapContext, any, TDeps, TSrc, TSeed>,
  ): Supply {
    return this._bsContext.get(BootstrapContextRegistry).provide(spec).needs(this);
  }

  perDefinition<TDeps extends any[], TSrc, TSeed>(
      spec: ContextValueSpec<DefinitionContext, any, TDeps, TSrc, TSeed>,
  ): Supply {
    return this._bsContext.get(PerDefinitionRegistry).provide(spec).needs(this);
  }

  perComponent<TDeps extends any[], TSrc, TSeed>(
      spec: ContextValueSpec<ComponentContext, any, TDeps, TSrc, TSeed>,
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
