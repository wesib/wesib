import { noop } from 'call-thru';
import { ContextKey, ContextValueSpec } from 'context-values';
import { EventEmitter } from 'fun-events';
import { Class, mergeFunctions } from '../../common';
import { ComponentClass, ComponentDef } from '../../component';
import { ComponentContext as ComponentContext_, ComponentListener } from '../../component/component-context';
import { ComponentFactory as ComponentFactory_ } from '../../component/definition';
import {
  DefinitionContext as DefinitionContext_,
  DefinitionListener,
  ElementBaseClass,
} from '../../component/definition/definition-context';
import { ComponentValueRegistry } from './component-value-registry';
import { DefinitionValueRegistry } from './definition-value-registry';

/**
 * Creates new component of the given type.
 *
 * It makes component context available under `[ComponentContext.symbol]` key in constructed component.
 * The component context is also available inside component constructor by temporarily assigning it to component
 * prototype.
 *
 * @param <T> A type of component.
 * @param type Component class constructor.
 * @param context Target component context.
 */
function newComponent<T extends object>(type: ComponentClass<T>, context: ComponentContext_<T>): T {

  const proto = type.prototype as any;
  const prevContext = proto[ComponentContext_.symbol];

  proto[ComponentContext_.symbol] = context;
  try {

    const component = new type(context);

    Object.defineProperty(component, ComponentContext_.symbol, { value: context });

    return component;
  } finally {
    proto[ComponentContext_.symbol] = prevContext;
  }
}

/**
 * @internal
 */
export class ElementBuilder {

  private readonly _definitionValueRegistry: DefinitionValueRegistry;
  private readonly _componentValueRegistry: ComponentValueRegistry;
  readonly definitions = new EventEmitter<DefinitionListener>();
  readonly components = new EventEmitter<ComponentListener>();

  static create(opts: {
    definitionValueRegistry: DefinitionValueRegistry;
    componentValueRegistry: ComponentValueRegistry;
  }): ElementBuilder {
    return new ElementBuilder(opts);
  }

  private constructor(
      {
        definitionValueRegistry,
        componentValueRegistry,
      }: {
        definitionValueRegistry: DefinitionValueRegistry;
        componentValueRegistry: ComponentValueRegistry;
      }) {
    this._definitionValueRegistry = definitionValueRegistry;
    this._componentValueRegistry = componentValueRegistry;
  }

  buildElement<T extends object>(componentType: ComponentClass<T>): ComponentFactory_<T> {

    const def = ComponentDef.of(componentType);
    const builder = this;
    const onComponent = new EventEmitter<ComponentListener>();
    let typeValueRegistry!: ComponentValueRegistry;
    let whenReady: (this: DefinitionContext, elementType: Class) => void = noop;
    let context: DefinitionContext;

    class ComponentFactory extends ComponentFactory_<T> {

      get componentType() {
        return context.componentType;
      }

      get elementType() {
        return context.elementType;
      }

    }

    const factory = new ComponentFactory();

    class DefinitionContext extends DefinitionContext_<T> {

      readonly componentType: ComponentClass<T> = componentType;
      readonly onComponent = onComponent.on;
      readonly get: <V, S>(key: ContextKey<V, S>, defaultValue: V | null | undefined) => V | null | undefined;

      constructor() {
        super();
        typeValueRegistry = ComponentValueRegistry.create(builder._definitionValueRegistry.bindSources(this));
        typeValueRegistry.provide({ a: DefinitionContext_, is: this });
        typeValueRegistry.provide({ a: ComponentFactory_, is: factory });

        const values = typeValueRegistry.newValues();

        this.get = values.get;
      }

      get elementType(): Class {
        throw new Error('Custom element class is not constructed yet. Consider to use a `whenReady()` callback');
      }

      whenReady(callback: (this: DefinitionContext, elementType: Class) => void) {
        whenReady = mergeFunctions<[Class], void, DefinitionContext>(whenReady, callback);
      }

      forComponents<S>(spec: ContextValueSpec<ComponentContext_<any>, any, any[], S>): void {
        typeValueRegistry.provide(spec);
      }

    }

    context = new DefinitionContext();

    if (def.define) {
      def.define.call(componentType, context);
    }
    this.definitions.forEach(listener => listener(context));

    const elementType = this._elementType(
        context,
        onComponent,
        this._componentValueRegistry.append(typeValueRegistry));

    Object.defineProperty(context, 'elementType', {
      configurable: true,
      enumerable: true,
      value: elementType,
    });
    Object.defineProperty(context, 'whenReady', {
      configurable: true,
      value(callback: (elementType: Class) => void) {
        callback.call(context, elementType);
      },
    });

    whenReady.call(context, elementType);

    return factory;
  }

  private _elementType<T extends object>(
      definitionContext: DefinitionContext_<T>,
      onComponent: EventEmitter<ComponentListener>,
      valueRegistry: ComponentValueRegistry) {

    const { componentType } = definitionContext;
    const builder = this;
    const elementBaseClass = definitionContext.get(ElementBaseClass);

    const connected = Symbol('connected');
    const connectedCallback = Symbol('connectedCallback');
    const disconnectedCallback = Symbol('disconnectedCallback');

    class Element extends elementBaseClass {

      // Component context reference
      [ComponentContext_.symbol]: ComponentContext_<T>;

      private readonly [connectedCallback]!: () => void;
      private readonly [disconnectedCallback]!: () => void;
      private [connected] = false;

      constructor() {
        super();

        const element = this;
        // @ts-ignore
        const elementSuper = (name: string) => super[name] as any;
        let whenReady: (this: ComponentContext, component: T) => void = noop;
        const connectEvents = new EventEmitter<(this: any) => void>();
        const disconnectEvents = new EventEmitter<(this: any) => void>();

        class ComponentContext extends ComponentContext_<T> {

          readonly componentType = definitionContext.componentType;
          readonly element = element;
          readonly elementSuper = elementSuper;
          readonly get = valueRegistry.newValues().get;
          readonly onConnect = connectEvents.on;
          readonly onDisconnect = disconnectEvents.on;

          get component(): T {
            throw new Error('The component is not constructed yet. Consider to use a `whenReady()` callback');
          }

          get connected() {
            return element[connected];
          }

          whenReady(callback: (this: ComponentContext, component: T) => void) {
            whenReady = mergeFunctions<[T], void, ComponentContext>(whenReady, callback);
          }

        }

        const context = new ComponentContext();

        valueRegistry.provide({ a: ComponentContext_, is: context });

        Object.defineProperty(this, ComponentContext_.symbol, { value: context });
        Object.defineProperty(this, connectedCallback, {
          value: () => connectEvents.forEach(listener => listener.call(context)),
        });
        Object.defineProperty(this, disconnectedCallback, {
          value: () => disconnectEvents.forEach(listener => listener.call(context)),
        });

        builder.components.forEach(consumer => consumer(context));
        onComponent.forEach(consumer => consumer(context));

        const component = newComponent(componentType, context);

        Object.defineProperty(context, 'component', {
          configurable: true,
          enumerable: true,
          value: component,
        });
        Object.defineProperty(context, 'whenReady', {
          configurable: true,
          value(callback: (component: T) => void) {
            callback.call(context, component);
          },
        });

        whenReady.call(context, component);
      }

      // noinspection JSUnusedGlobalSymbols
      connectedCallback() {
        this[connected] = true;
        this[connectedCallback]();
      }

      // noinspection JSUnusedGlobalSymbols
      disconnectedCallback() {
        this[connected] = false;
        this[disconnectedCallback]();
      }

    }

    return Element;
  }
}
