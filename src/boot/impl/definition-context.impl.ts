import { ContextValues, ContextValueSpec } from '@proc7ts/context-values';
import { mapOn_, onceOn, OnEvent, trackValue, translateOn, ValueTracker } from '@proc7ts/fun-events';
import { Class, valueProvider } from '@proc7ts/primitives';
import { Supply } from '@proc7ts/supply';
import { ComponentContext, ComponentDef, ComponentElement, ComponentSlot } from '../../component';
import { DefinitionContext, DefinitionSetup, ElementDef, ElementNaming } from '../../component/definition';
import { BootstrapContext } from '../bootstrap-context';
import { DocumentRenderKit } from '../globals';
import { ComponentContextRegistry, PerComponentRegistry } from './component-context-registry.impl';
import { ComponentContext$Mounted } from './component-context.impl';
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

  readonly whenReady: OnEvent<[this]>;
  readonly get: ContextValues['get'];
  readonly elementDef: ElementDef;
  private readonly _def: ComponentDef<T>;
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
    this._whenReady = this._ready.read.do(translateOn((send, ready) => ready && send()));
    this._def = ComponentDef.of(componentType);
    this.elementDef = _bsContext.get(ElementNaming).elementOf(componentType);

    const definitionContextRegistry = new DefinitionContextRegistry(_bsContext.get(PerDefinitionRegistry).seeds());

    definitionContextRegistry.provide({ a: DefinitionContext, is: this });

    this.get = definitionContextRegistry.newValues().get;

    const parentPerComponentRegistry = _bsContext.get(PerComponentRegistry).append(seedKey => this.get(seedKey));
    this._perComponentRegistry = new ComponentContextRegistry(parentPerComponentRegistry.seeds());

    this.whenReady = this._whenReady.do(mapOn_(valueProvider(this)), onceOn);

    const definitionSetup: DefinitionSetup<T> = {
      get componentType() {
        return componentType;
      },
      whenReady: this.whenReady,
      whenComponent: this.whenComponent,
      perDefinition: spec => definitionContextRegistry.provide(spec),
      perComponent: spec => this._perComponentRegistry.provide(spec),
    };

    this._def.setup?.(definitionSetup);
    postDefSetup(componentType).setup(definitionSetup);
  }

  get elementType(): Class {
    return this._elementType();
  }

  get whenComponent(): OnEvent<[ComponentContext<T>]> {
    return this._whenComponent.onCreated;
  }

  mountTo(element: ComponentElement<T>): ComponentContext<T> {

    const context = new ComponentContext$Mounted(this, element);

    ComponentSlot.of<T>(element).bind(context);
    context._createComponent();

    const drekContext = context.get(DocumentRenderKit).contextOf(element);

    drekContext.whenSettled(_ => context.settle()).needs(context);
    drekContext.whenConnected(_ => context._connect()).needs(context);
    context._created();

    return context;
  }

  perComponent<TSrc, TDeps extends any[]>(
      spec: ContextValueSpec<ComponentContext<T>, unknown, TSrc, TDeps>,
  ): Supply {
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
