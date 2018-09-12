import { Class, EventEmitter, mergeFunctions, noop, StateUpdateConsumer, StateValueKey } from '../../common';
import { BootstrapContext, ComponentListener } from '../../feature';
import { Component, ComponentClass } from '../component';
import { ComponentContext } from '../component-context';
import { ComponentDef } from '../component-def';
import { ComponentValueRegistry } from './component-value-registry';
import { DefinitionContext, DefinitionListener } from './definition-context';

/**
 * @internal
 */
export class ElementBuilder {

  readonly bootstrapContext: BootstrapContext;
  readonly componentValueRegistry: ComponentValueRegistry;
  readonly definitions = new EventEmitter<DefinitionListener>();
  readonly components = new EventEmitter<ComponentListener>();

  static create(opts: {
    bootstrapContext: BootstrapContext,
    valueRegistry: ComponentValueRegistry;
  }): ElementBuilder {
    return new ElementBuilder(opts);
  }

  private constructor(
      {
        bootstrapContext,
        valueRegistry,
      }: {
        bootstrapContext: BootstrapContext,
        valueRegistry: ComponentValueRegistry,
      }) {
    this.bootstrapContext = bootstrapContext;
    this.componentValueRegistry = valueRegistry;
  }

  baseElementType<T extends object>(def: ComponentDef<T>): Class {
    return def.extend && def.extend.type || this.bootstrapContext.get(BootstrapContext.baseElementKey);
  }

  buildElement<T extends object>(componentType: ComponentClass<T>): Class {

    let whenReady: (this: ElementDefinitionContext, elementType: Class) => void = noop;

    class ElementDefinitionContext implements DefinitionContext<T> {

      readonly componentType: ComponentClass<T> = componentType;

      get elementType(): Class {
        throw new Error('Custom element class is not constructed yet. Consider to use a `whenReady()` callback');
      }

      whenReady(callback: (this: ElementDefinitionContext, elementType: Class) => void) {
        whenReady = mergeFunctions<[Class], void, ElementDefinitionContext>(whenReady, callback);
      }

    }

    const context = new ElementDefinitionContext();

    this.definitions.notify(context as DefinitionContext<any>);

    const elementType = this._elementType(componentType);

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

  private _elementType<T extends object>(componentType: ComponentClass<T>) {

    const builder = this;
    const def = ComponentDef.of(componentType);
    const baseElementType = this.baseElementType(def);

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
        const values = builder.componentValueRegistry.newValues();
        let whenReady: (this: ElementContext, component: T) => void = noop;
        const connectEvents = new EventEmitter<(this: ElementContext) => void>();
        const disconnectEvents = new EventEmitter<(this: ElementContext) => void>();

        class ElementContext implements ComponentContext<T> {

          readonly element = element;
          readonly elementSuper = elementSuper;
          readonly get = values.get;
          readonly onConnect = connectEvents.on;
          readonly onDisconnect = disconnectEvents.on;
          readonly updateState: StateUpdateConsumer = (<V>(key: StateValueKey, newValue: V, oldValue: V) => {
            this.get(ComponentContext.stateUpdateKey)(key, newValue, oldValue);
          });

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

        Object.defineProperty(this, ComponentContext.symbol, { value: context });
        Object.defineProperty(this, connectedCallback, {
          value: () => connectEvents.forEach(listener => listener.call(context)),
        });
        Object.defineProperty(this, disconnectedCallback, {
          value: () => disconnectEvents.forEach(listener => listener.call(context)),
        });

        builder.components.notify(context);

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
