import { CxBuilder, cxConstAsset } from '@proc7ts/context-builder';
import { CxModule } from '@proc7ts/context-modules';
import { CxAsset, CxGetter } from '@proc7ts/context-values';
import { onceOn, OnEvent, supplyOn, valueOn_ } from '@proc7ts/fun-events';
import { Class } from '@proc7ts/primitives';
import { Supply, SupplyPeer } from '@proc7ts/supply';
import { BootstrapContext } from '../../boot';
import { ComponentContext } from '../../component';
import { ComponentClass, DefinitionContext, DefinitionSetup } from '../../component/definition';
import { BootstrapContextBuilder, ElementBuilder, onPostDefSetup } from '../../impl';
import { PerComponentCxPeer } from '../../impl/component-context';
import { PerDefinitionCxPeer } from '../../impl/definition-context';
import { FeatureContext } from '../feature-context';
import { FeatureRef } from '../feature-ref';
import { ComponentRegistry } from './component-registry.impl';

export class FeatureContext$ implements FeatureContext {

  static create(feature: Class, setup: CxModule.Setup): FeatureContext {

    const bsBuilder = setup.get(BootstrapContextBuilder);
    const builder = new CxBuilder<FeatureContext>(
        get => new FeatureContext$(feature, get, setup),
        bsBuilder.boundPeer,
    );
    const context = builder.context;

    builder.provide(cxConstAsset(FeatureContext, context));

    return context;
  }

  readonly whenReady: OnEvent<[FeatureContext]>;
  private _onDefinition?: OnEvent<[DefinitionContext]>;
  private _onComponent?: OnEvent<[ComponentContext]>;
  private readonly _bsContext: BootstrapContext;
  private readonly _componentRegistry: ComponentRegistry;

  private constructor(
      readonly feature: Class,
      readonly get: CxGetter,
      private readonly _setup: CxModule.Setup,
  ) {
    this._bsContext = _setup.get(BootstrapContext);

    const handle = _setup.get(_setup.module);

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

  provide<TValue, TAsset = TValue>(asset: CxAsset<TValue, TAsset, BootstrapContext>): Supply {
    return this._bsContext
        .get(BootstrapContextBuilder)
        .provide(asset)
        .needs(this);
  }

  perDefinition<TValue, TAsset = TValue>(asset: CxAsset<TValue, TAsset, DefinitionContext>): Supply {
    return this._bsContext
        .get(PerDefinitionCxPeer)
        .provide(asset)
        .needs(this);
  }

  perComponent<TValue, TAsset = TValue>(asset: CxAsset<TValue, TAsset, ComponentContext>): Supply {
    return this._bsContext
        .get(PerComponentCxPeer)
        .provide(asset)
        .needs(this);
  }

  setupDefinition<T extends object>(componentType: ComponentClass<T>): OnEvent<[DefinitionSetup]> {
    return onPostDefSetup(componentType, this.supply);
  }

  define<T extends object>(componentType: ComponentClass<T>): void {
    this._componentRegistry.define(componentType);
  }

  whenDefined<T extends object>(componentType: ComponentClass<T>): OnEvent<[DefinitionContext<T>]> {
    return this.get(BootstrapContext).whenDefined(componentType);
  }

  load(feature: Class, user?: SupplyPeer): FeatureRef {
    return this.get(BootstrapContext).load(
        feature,
        user ? new Supply().needs(this).needs(user) : this,
    );
  }

}
