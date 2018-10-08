import { Class, ContextValueKey, EventEmitter, mergeFunctions, noop } from '../../common';
import { Component, ComponentClass } from '../component';
import { ComponentContext, ComponentListener, ComponentValueProvider } from '../component-context';
import { ComponentDef } from '../component-def';
import { ComponentValueRegistry } from './component-value-registry';
import { DefinitionContext, DefinitionListener } from './definition-context';
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
    let whenReady: (this: ElementDefinitionContext, elementType: Class) => void = noop;

    class ElementDefinitionContext extends DefinitionContext<T> {

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

      whenReady(callback: (this: ElementDefinitionContext, elementType: Class) => void) {
        whenReady = mergeFunctions<[Class], void, ElementDefinitionContext>(whenReady, callback);
      }

      forComponents<S>(key: ContextValueKey<any, S>, provider: ComponentValueProvider<S>): void {
        typeValueRegistry.provide(key, provider);
      }

    }

    const context = new ElementDefinitionContext();

    if (def.define) {
      def.define.call(componentType, context);
    }
    this.definitions.notify(context as DefinitionContext<any>);

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

  private _baseElementType<T extends object>(definitionContext: DefinitionContext<T>, def: ComponentDef<T>): Class {
    return def.extend && def.extend.type || definitionContext.get(DefinitionContext.baseElementKey);
  }

  private _elementType<T extends object>(
      def: ComponentDef<T>,
      definitionContext: DefinitionContext<T>,
      onComponent: EventEmitter<ComponentListener>,
      valueRegistry: ComponentValueRegistry) {

    const { componentType } = definitionContext;
    const builder = this;
    const baseElementType = this._baseElementType(definitionContext, def);

    const connected = Symbol('connected');
    const connectedCallback = Symbol('connectedCallback');
    const disconnectedCallback = Symbol('disconnectedCallback');

    class Element extends baseElementType {

      // Component reference
      [Component.symbol]: T;

      // Component context reference
      [ComponentContext.symbol]: ComponentContext<T>;

      private readonly [connectedCallback]!: () => void;
      private readonly [disconnectedCallback]!: () => void;
      private [connected] = false;

      constructor() {
        super();

        const element = this;
        // @ts-ignore
        const elementSuper = (name: string) => super[name] as any;
        let whenReady: (this: ElementContext, component: T) => void = noop;
        const connectEvents = new EventEmitter<(this: ElementContext) => void>();
        const disconnectEvents = new EventEmitter<(this: ElementContext) => void>();

        class ElementContext extends ComponentContext<T> {

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

          whenReady(callback: (this: ElementContext, component: T) => void) {
            whenReady = mergeFunctions<[T], void, ElementContext>(whenReady, callback);
          }

        }

        const context = new ElementContext();

        valueRegistry.provide(ComponentContext.key, () => context);

        Object.defineProperty(this, ComponentContext.symbol, { value: context });
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
