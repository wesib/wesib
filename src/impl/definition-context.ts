import { DocumentRenderKit } from '@frontmeans/drek';
import { CxBuilder, cxConstAsset, CxPeerBuilder } from '@proc7ts/context-builder';
import { CxAccessor, CxAsset, CxEntry, cxEvaluated, cxScoped } from '@proc7ts/context-values';
import { mapOn_, onceOn, OnEvent, trackValue, translateOn, ValueTracker } from '@proc7ts/fun-events';
import { Class, valueProvider } from '@proc7ts/primitives';
import { Supply } from '@proc7ts/supply';
import { BootstrapContext } from '../boot';
import { ComponentContext, ComponentDef, ComponentElement, ComponentSlot } from '../component';
import { DefinitionContext, DefinitionSetup, ElementDef } from '../component/definition';
import { ElementNaming } from '../globals';
import { BootstrapContextBuilder } from './bootstrap-context-builder';
import { ComponentContext$Mounted, PerComponentCxPeer } from './component-context';
import { customElementType } from './custom-element';
import { ComponentDefinitionClass, DefinitionContext__symbol } from './definition-context.symbol';
import { ElementBuilder } from './element-builder';
import { postDefSetup } from './post-def-setup';
import { WhenComponent } from './when-component';

export const PerDefinitionCxPeer: CxEntry<CxPeerBuilder<DefinitionContext>> = {
  perContext: (/*#__PURE__*/ cxScoped(
      BootstrapContext,
      (/*#__PURE__*/ cxEvaluated(_target => new CxPeerBuilder())),
  )),
  toString: () => '[PerDefinitionCxPeer]',
};

export class DefinitionContext$<T extends object> implements DefinitionContext<T> {

  static create<T extends object>(
      bsContext: BootstrapContext,
      elementBuilder: ElementBuilder,
      componentType: ComponentDefinitionClass<T>,
  ): DefinitionContext$<T> {

    const cxBuilder = new CxBuilder<DefinitionContext$<T>>(
        (get, builder) => new DefinitionContext$(
            bsContext,
            elementBuilder,
            componentType,
            builder,
            get,
        ),
        bsContext.get(BootstrapContextBuilder).boundPeer,
        bsContext.get(PerDefinitionCxPeer),
    );
    const context = cxBuilder.context;

    cxBuilder.provide(cxConstAsset(DefinitionContext, context));

    return context;
  }

  readonly whenReady: OnEvent<[this]>;
  readonly elementDef: ElementDef;
  private readonly _def: ComponentDef<T>;
  readonly _whenComponent = new WhenComponent<T>();
  private readonly _ready: ValueTracker<boolean>;
  private readonly _whenReady: OnEvent<[]>;
  private readonly _perComponentCxPeer: CxPeerBuilder<ComponentContext>;

  private constructor(
      readonly _bsContext: BootstrapContext,
      readonly _elementBuilder: ElementBuilder,
      readonly componentType: ComponentDefinitionClass<T>,
      readonly _cxBuilder: CxBuilder<DefinitionContext>,
      readonly get: CxAccessor,
  ) {
    this._ready = trackValue(false);
    this._whenReady = this._ready.read.do(translateOn((send, ready) => ready && send()));
    this._def = ComponentDef.of(componentType);
    this.elementDef = _bsContext.get(ElementNaming).elementOf(componentType);
    this._perComponentCxPeer = new CxPeerBuilder(_bsContext.get(PerComponentCxPeer));

    this.whenReady = this._whenReady.do(mapOn_(valueProvider(this)), onceOn);

    const definitionSetup: DefinitionSetup<T> = {
      get componentType() {
        return componentType;
      },
      whenReady: this.whenReady,
      whenComponent: this.whenComponent,
      perDefinition: asset => _cxBuilder.provide(asset),
      perComponent: asset => this._perComponentCxPeer.provide(asset),
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

    const context = ComponentContext$Mounted.create(this, element);

    ComponentSlot.of<T>(element).bind(context);
    context._createComponent();

    const drekContext = context.get(DocumentRenderKit).contextOf(element);

    drekContext.whenSettled(_ => context.settle()).needs(context);
    drekContext.whenConnected(_ => context._connect()).needs(context);
    context._created();

    return context;
  }

  perComponent<TValue, TAsset = TValue>(asset: CxAsset<TValue, TAsset, ComponentContext>): Supply {
    return this._perComponentCxPeer.provide(asset);
  }

  _newComponentContext<TContext extends ComponentContext<T>>(
      createContext: (get: CxAccessor, builder: CxBuilder<TContext>) => TContext,
  ): TContext {

    const builder = new CxBuilder<TContext>(
        createContext,
        this._cxBuilder.boundPeer,
        this._perComponentCxPeer,
    );
    const context = builder.context;

    builder.provide(cxConstAsset(ComponentContext, context));

    return context;
  }

  _elementType(): Class {
    throw new TypeError('Custom element class is not constructed yet. Consider to use a `whenReady()` callback');
  }

  _define(): void {
    this._def.define?.(this);
    this._elementBuilder.definitions.send(this);
    this._elementType = valueProvider(customElementType(this));
    this.componentType[DefinitionContext__symbol] = this;
    this._ready.it = true;
  }

}
