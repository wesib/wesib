import { nextArg, nextSkip } from '@proc7ts/call-thru';
import { ContextRegistry, ContextValueSpec } from '@proc7ts/context-values';
import { afterAll, EventReceiver, EventSupply, OnEvent, trackValue } from '@proc7ts/fun-events';
import { Class } from '@proc7ts/primitives';
import { BootstrapContext } from '../../boot';
import {
  BootstrapContextRegistry,
  ComponentContextRegistry,
  DefinitionContextRegistry,
  ElementBuilder,
  newUnloader,
  onPostDefSetup,
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

  readonly _unloader = newUnloader();
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
    this._componentRegistry = new ComponentRegistry(this);
  }

  get feature(): Class {
    return this._loader.request.feature;
  }

  whenReady(): OnEvent<[FeatureContext]>;
  whenReady(receiver: EventReceiver<[FeatureContext]>): EventSupply;
  whenReady(receiver?: EventReceiver<[FeatureContext]>): OnEvent<[FeatureContext]> | EventSupply {
    return (this.whenReady = afterAll({
      st: this._loader.state,
      bs: trackValue<BootstrapContext>().by(this._bsContext.whenReady()),
    }).thru(
        ({
          st: [ready],
          bs: [bs],
        }) => bs && ready ? nextArg(this) : nextSkip(),
    ).once().F)(receiver);
  }

  onDefinition(): OnEvent<[DefinitionContext]>;
  onDefinition(receiver: EventReceiver<[DefinitionContext]>): EventSupply;
  onDefinition(receiver?: EventReceiver<[DefinitionContext]>): OnEvent<[DefinitionContext]> | EventSupply {
    return (this.onDefinition = this._bsContext.get(ElementBuilder).definitions.on()
        .tillOff(this._unloader.supply).F)(receiver);
  }

  onComponent(): OnEvent<[ComponentContext]>;
  onComponent(receiver: EventReceiver<[ComponentContext]>): EventSupply;
  onComponent(receiver?: EventReceiver<[ComponentContext]>): EventSupply | OnEvent<[ComponentContext]> {
    return (this.onComponent = this._bsContext.get(ElementBuilder).components.on()
        .tillOff(this._unloader.supply).F)(receiver);
  }

  provide<Deps extends any[], Src, Seed>(
      spec: ContextValueSpec<BootstrapContext, any, Deps, Src, Seed>,
  ): () => void {
    return this._unloader.add(() => this._bsContext.get(BootstrapContextRegistry).provide(spec));
  }

  perDefinition<Deps extends any[], Src, Seed>(
      spec: ContextValueSpec<DefinitionContext, any, Deps, Src, Seed>,
  ): () => void {
    return this._unloader.add(() => this._bsContext.get(DefinitionContextRegistry).provide(spec));
  }

  perComponent<Deps extends any[], Src, Seed>(
      spec: ContextValueSpec<ComponentContext, any, Deps, Src, Seed>,
  ): () => void {
    return this._unloader.add(() => this._bsContext.get(ComponentContextRegistry).provide(spec));
  }

  setupDefinition<T extends object>(componentType: ComponentClass<T>): OnEvent<[DefinitionSetup]> {
    return onPostDefSetup(componentType, this._unloader);
  }

  define<T extends object>(componentType: ComponentClass<T>): void {
    this._componentRegistry.define(componentType);
  }

}
