import { Class, EventEmitter, mergeFunctions, noop, StateUpdateConsumer, StateValueKey } from '../../common';
import { BootstrapContext, ComponentListener } from '../../feature';
import { Component, ComponentClass } from '../component';
import { ComponentContext } from '../component-context';
import { ComponentDef } from '../component-def';
import { ComponentValueRegistry } from './component-value-registry';

/**
 * @internal
 */
export class ElementBuilder {

  readonly bootstrapContext: BootstrapContext;
  readonly componentValueRegistry: ComponentValueRegistry;
  readonly elements = new EventEmitter<ComponentListener>();

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

  elementType<T extends object>(def: ComponentDef<T>): Class {
    return def.extend && def.extend.type || this.bootstrapContext.get(BootstrapContext.baseElementKey);
  }

  buildElement<T extends object>(
      componentType: ComponentClass<T>):
      Class {

    const builder = this;
    const def = ComponentDef.of(componentType);
    const elementType = this.elementType(def);
    let connected = false;

    const connectedCallback = Symbol('connectedCallback');
    const disconnectedCallback = Symbol('disconnectedCallback');

    class Element extends elementType {

      // Component reference
      [Component.symbol]: T;

      // Component context reference
      [ComponentContext.symbol]: ComponentContext<T>;

      private readonly [connectedCallback]!: () => void;
      private readonly [disconnectedCallback]!: () => void;

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
            throw new Error('The component is not constructed yet. Consider to use a `whenConstructed` callback');
          }

          get connected() {
            return connected;
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

        builder.elements.notify(context);

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
        connected = true;
        this[connectedCallback]();
      }

      // noinspection JSUnusedGlobalSymbols
      disconnectedCallback() {
        connected = false;
        this[disconnectedCallback]();
      }

    }

    return Element;
  }

}
