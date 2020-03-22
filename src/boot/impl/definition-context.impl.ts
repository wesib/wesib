import { nextArgs, nextSkip, valueProvider } from '@proc7ts/call-thru';
import { ContextValues, ContextValueSpec } from '@proc7ts/context-values';
import { EventReceiver, EventSupply, OnEvent, trackValue } from '@proc7ts/fun-events';
import { Class } from '../../common';
import { ComponentContext, ComponentDef } from '../../component';
import { ComponentClass, ComponentFactory, DefinitionContext, DefinitionSetup } from '../../component/definition';
import { BootstrapContext } from '../bootstrap-context';
import { ComponentContextRegistry } from './component-context-registry.impl';
import { ComponentFactory$ } from './component-factory.impl';
import { customElementType } from './custom-element.impl';
import { DefinitionContextRegistry } from './definition-context-registry.impl';
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
  private readonly _ready = trackValue(false);
  private readonly _whenReady: OnEvent<[]> = this._ready.read().thru(ready => ready ? nextArgs() : nextSkip());
  private readonly _perTypeRegistry: ComponentContextRegistry;

  constructor(
      readonly _bsContext: BootstrapContext,
      readonly _elementBuilder: ElementBuilder,
      readonly componentType: ComponentClass<T>,
  ) {
    super();
    this._def = ComponentDef.of(componentType);

    const definitionContextRegistry = new DefinitionContextRegistry(
        _bsContext.get(DefinitionContextRegistry).seedIn(this),
    );

    definitionContextRegistry.provide({ a: DefinitionContext, is: this });
    definitionContextRegistry.provide({
      a: ComponentFactory,
      by: () => new ComponentFactory$<T>(this),
    });
    this.get = definitionContextRegistry.newValues().get;
    this._perTypeRegistry = new ComponentContextRegistry(definitionContextRegistry.seedIn(this));

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
      perComponent: spec => this._perTypeRegistry.provide(spec),
    };

    this._def.setup?.(definitionSetup);
    postDefSetup(componentType).setup(definitionSetup);
  }

  get elementType(): Class {
    throw new Error('Custom element class is not constructed yet. Consider to use a `whenReady()` callback');
  }

  whenReady(): OnEvent<[this]>;
  whenReady(receiver: EventReceiver<[this]>): EventSupply;
  whenReady(receiver?: EventReceiver<[this]>): EventSupply | OnEvent<[this]> {
    return (this.whenReady = (this._whenReady.thru_(valueProvider(this)).once() as OnEvent<[this]>).F)(receiver);
  }

  whenComponent(): OnEvent<[ComponentContext<T>]>;
  whenComponent(receiver: EventReceiver<[ComponentContext<T>]>): EventSupply;
  whenComponent(receiver?: EventReceiver<[ComponentContext<T>]>): OnEvent<[ComponentContext<T>]> | EventSupply {
    return (this.whenComponent = this._whenComponent.onCreated.F)(receiver);
  }

  perComponent<Deps extends any[], Src, Seed>(
      spec: ContextValueSpec<ComponentContext<T>, any, Deps, Src, Seed>,
  ): () => void {
    return this._perTypeRegistry.provide(spec);
  }

  _newComponentRegistry(): ComponentContextRegistry {
    return this._bsContext.get(ComponentContextRegistry).append(this._perTypeRegistry);
  }

  _factory(): ComponentFactory<T> {
    this._def.define?.(this);
    this._elementBuilder.definitions.send(this);

    const elementType = customElementType(this);

    Object.defineProperty(this, 'elementType', {
      configurable: true,
      enumerable: true,
      value: elementType,
    });

    this._ready.it = true;

    return this.get(ComponentFactory);
  }

}
