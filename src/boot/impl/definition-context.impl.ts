import { nextArgs, nextSkip } from '@proc7ts/call-thru';
import { ContextValues, ContextValueSpec } from '@proc7ts/context-values';
import { EventReceiver, EventSupply, OnEvent, trackValue, ValueTracker } from '@proc7ts/fun-events';
import { Class, valueProvider } from '@proc7ts/primitives';
import { ComponentContext, ComponentContext__symbol, ComponentDef, ComponentMount } from '../../component';
import { DefinitionContext, DefinitionSetup } from '../../component/definition';
import { BootstrapContext } from '../bootstrap-context';
import { ComponentContextRegistry, PerComponentRegistry } from './component-context-registry.impl';
import { MountComponentContext$ } from './component-mount.impl';
import { customElementType } from './custom-element.impl';
import { DefinitionContextRegistry, PerDefinitionRegistry } from './definition-context-registry.impl';
import { ComponentDefinitionClass, DefinitionContext__symbol } from './definition-context.symbol.impl';
import { ElementBuilder } from './element-builder.impl';
import { postDefSetup } from './post-def-setup.impl';
import { WhenComponent } from './when-component.impl';

/**
 * @internal
 */
export class DefinitionContext$<T extends object> extends DefinitionContext<T> {

  readonly get: ContextValues['get'];
  private readonly _def: ComponentDef.Options<T>;
  readonly _whenComponent = new WhenComponent<T>();
  private readonly _ready: ValueTracker<boolean>;
  private readonly _whenReady: OnEvent<[]>;
  private readonly _perComponentRegistry: ComponentContextRegistry;

  constructor(
      readonly _bsContext: BootstrapContext,
      readonly _elementBuilder: ElementBuilder,
      readonly componentType: ComponentDefinitionClass<T>,
  ) {
    super();
    this._ready = trackValue(false);
    this._whenReady = this._ready.read().thru(ready => ready ? nextArgs() : nextSkip());
    this._def = ComponentDef.of(componentType);

    const definitionContextRegistry = new DefinitionContextRegistry(
        _bsContext.get(PerDefinitionRegistry).seedIn(this),
    );

    definitionContextRegistry.provide({ a: DefinitionContext, is: this });

    this.get = definitionContextRegistry.newValues().get;

    const parentPerComponentRegistry = _bsContext.get(PerComponentRegistry).append(seedKey => this.get(seedKey));
    this._perComponentRegistry = new ComponentContextRegistry(parentPerComponentRegistry.seeds());

    const whenReady$ = this.whenReady().F;
    const whenComponent$ = this.whenComponent().F;

    const definitionSetup: DefinitionSetup<T> = {
      get componentType() {
        return componentType;
      },
      get whenReady() {
        return whenReady$;
      },
      get whenComponent() {
        return whenComponent$;
      },
      perDefinition: spec => definitionContextRegistry.provide(spec),
      perComponent: spec => this._perComponentRegistry.provide(spec),
    };

    this._def.setup?.(definitionSetup);
    postDefSetup(componentType).setup(definitionSetup);
  }

  get elementType(): Class {
    return this._elementType();
  }

  whenReady(): OnEvent<[this]>;
  whenReady(receiver: EventReceiver<[this]>): EventSupply;
  whenReady(receiver?: EventReceiver<[this]>): EventSupply | OnEvent<[this]> {
    return (this.whenReady = (this._whenReady.thru_(valueProvider(this)).once() as OnEvent<[this]>).F)(receiver);
  }

  mountTo(element: any): ComponentMount<T> {
    if (element[ComponentContext__symbol]) {
      throw new Error(`Element ${String(element)} already bound to component`);
    }

    const context = new MountComponentContext$(this, element);

    context._createComponent();

    const { mount } = context;

    mount.checkConnected();
    context._created();
    context.settle();

    return mount;
  }

  whenComponent(): OnEvent<[ComponentContext<T>]>;
  whenComponent(receiver: EventReceiver<[ComponentContext<T>]>): EventSupply;
  whenComponent(receiver?: EventReceiver<[ComponentContext<T>]>): OnEvent<[ComponentContext<T>]> | EventSupply {
    return (this.whenComponent = this._whenComponent.onCreated.F)(receiver);
  }

  perComponent<Deps extends any[], Src, Seed>(
      spec: ContextValueSpec<ComponentContext<T>, any, Deps, Src, Seed>,
  ): () => void {
    return this._perComponentRegistry.provide(spec);
  }

  _newComponentRegistry(): ComponentContextRegistry {
    return new ComponentContextRegistry(this._perComponentRegistry.seeds());
  }

  _elementType(): Class {
    throw new Error('Custom element class is not constructed yet. Consider to use a `whenReady()` callback');
  }

  _define(): void {
    this._def.define?.(this);
    this._elementBuilder.definitions.send(this);
    this._elementType = valueProvider(customElementType(this));
    this.componentType[DefinitionContext__symbol] = this;
    this._ready.it = true;
  }

}
