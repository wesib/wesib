import { Class, ContextValueKey, ContextValueSpec, EventEmitter, mergeFunctions, noop } from '../../common';
import { Component, ComponentClass } from '../component';
import { ComponentContext as ComponentContext_, ComponentListener } from '../component-context';
import { ComponentDef } from '../component-def';
import { ComponentValueRegistry } from './component-value-registry';
import { DefinitionContext as DefinitionContext_, DefinitionListener, ElementBaseClass } from './definition-context';
import { DefinitionValueRegistry } from './definition-value-registry';

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

  buildElement<T extends object>(componentType: ComponentClass<T>): Class {

    const def = ComponentDef.of(componentType);
    const builder = this;
    const onComponent = new EventEmitter<ComponentListener>();
    let typeValueRegistry!: ComponentValueRegistry;
    let whenReady: (this: DefinitionContext, elementType: Class) => void = noop;

    class DefinitionContext extends DefinitionContext_<T> {

      readonly componentType: ComponentClass<T> = componentType;
      readonly onComponent = onComponent.on;
      readonly get: <V, S>(key: ContextValueKey<V, S>, defaultValue: V | null | undefined) => V | null | undefined;

      constructor() {
        super();
        typeValueRegistry = ComponentValueRegistry.create(builder._definitionValueRegistry.bindSources(this));

        const values = typeValueRegistry.newValues();

        this.get = values.get;
      }

      get elementType(): Class {
        throw new Error('Custom element class is not constructed yet. Consider to use a `whenReady()` callback');
      }

      whenReady(callback: (this: DefinitionContext, elementType: Class) => void) {
        whenReady = mergeFunctions<[Class], void, DefinitionContext>(whenReady, callback);
      }

      forComponents<S>(spec: ContextValueSpec<ComponentContext_<any>, any, S>): void {
        typeValueRegistry.provide(spec);
      }

    }

    const context = new DefinitionContext();

    if (def.define) {
      def.define.call(componentType, context);
    }
    this.definitions.forEach(listener => listener(context));

    const elementType = this._elementType(
        def,
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

    return elementType;
  }

  private _elementBaseClass<T extends object>(
      definitionContext: DefinitionContext_<T>,
      def: ComponentDef<T>): ElementBaseClass {
    return def.extend && def.extend.type || definitionContext.get(ElementBaseClass);
  }

  private _elementType<T extends object>(
      def: ComponentDef<T>,
      definitionContext: DefinitionContext_<T>,
      onComponent: EventEmitter<ComponentListener>,
      valueRegistry: ComponentValueRegistry) {

    const { componentType } = definitionContext;
    const builder = this;
    const baseElementType = this._elementBaseClass(definitionContext, def);

    const connected = Symbol('connected');
    const connectedCallback = Symbol('connectedCallback');
    const disconnectedCallback = Symbol('disconnectedCallback');

    class Element extends baseElementType {

      // Component reference
      [Component.symbol]: T;

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
        const connectEvents = new EventEmitter<(this: ComponentContext) => void>();
        const disconnectEvents = new EventEmitter<(this: ComponentContext) => void>();

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

        valueRegistry.provide({ provide: ComponentContext_, value: context });

        Object.defineProperty(this, ComponentContext_.symbol, { value: context });
        Object.defineProperty(this, connectedCallback, {
          value: () => connectEvents.forEach(listener => listener.call(context)),
        });
        Object.defineProperty(this, disconnectedCallback, {
          value: () => disconnectEvents.forEach(listener => listener.call(context)),
        });

        builder.components.forEach(consumer => consumer(context));
        onComponent.forEach(consumer => consumer(context));

        const component = Component.create(componentType, context);

        Object.defineProperty(this, Component.symbol, { value: component });
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
