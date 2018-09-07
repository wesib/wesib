import { EventEmitter, StateUpdateConsumer, StateValueKey } from '../common';
import { Component, ComponentContext, ComponentDef, ComponentElementType, ComponentType } from '../component';
import { ElementListener } from '../feature';
import { PromiseResolver } from '../util';
import { ComponentValueRegistry } from './component-value-registry';
import { ElementClass } from './element';

const WINDOW = window;

/**
 * @internal
 */
export class ElementBuilder {

  readonly window: Window;
  readonly valueRegistry: ComponentValueRegistry;
  readonly elements = new EventEmitter<ElementListener>();

  static create(opts: { window?: Window, valueRegistry: ComponentValueRegistry }): ElementBuilder {
    return new ElementBuilder(opts);
  }

  private constructor(
      {
        window = WINDOW,
        valueRegistry,
      }: {
        window?: Window,
        valueRegistry: ComponentValueRegistry,
      }) {
    this.window = window;
    this.valueRegistry = valueRegistry;
  }

  elementType<T extends object>(def: ComponentDef<T>): ElementClass<ComponentElementType<T>> {
    return def.extend && def.extend.type || ((this.window as any).HTMLElement as ElementClass<ComponentElementType<T>>);
  }

  buildElement<T extends object>(
      componentType: ComponentType<T>):
      ElementClass<ComponentElementType<T>> {

    const builder = this;
    const Object = (this.window as any).Object;
    const def = ComponentDef.of(componentType);
    const elementType: ElementClass<HTMLElement> = this.elementType(def);
    let connected = false;

    const connectedCallback = Symbol('connectedCallback');
    const disconnectedCallback = Symbol('disconnectedCallback');

    class Element extends elementType {

      // Component reference
      [Component.symbol]: T;

      // Component context reference
      [ComponentContext.symbol]: ComponentContext<T, ComponentElementType<T>>;

      private readonly [connectedCallback]!: () => void;
      private readonly [disconnectedCallback]!: () => void;

      constructor() {
        super();

        const componentResolver = new PromiseResolver<T>();

        try {

          const element: ComponentElementType<T> = this;
          // @ts-ignore
          const elementSuper = (name: string) => super[name] as any;
          const values = builder.valueRegistry.newValues();
          const connectEvents = new EventEmitter<(this: Context) => void>();
          const disconnectEvents = new EventEmitter<(this: Context) => void>();

          class Context implements ComponentContext<T, ComponentElementType<T>> {

            readonly element = element;
            readonly component = componentResolver.promise;
            readonly elementSuper = elementSuper;
            readonly get = values.get;
            readonly onConnect = connectEvents.on;
            readonly onDisconnect = disconnectEvents.on;
            readonly updateState: StateUpdateConsumer = (<V>(key: StateValueKey, newValue: V, oldValue: V) => {
              this.get(ComponentContext.stateUpdateKey)(key, newValue, oldValue);
            });

            get connected() {
              return connected;
            }

          }

          const context = new Context();

          Object.defineProperty(this, ComponentContext.symbol, { value: context });
          Object.defineProperty(this, connectedCallback, {
            value: () => connectEvents.forEach(listener => listener.call(context)),
          });
          Object.defineProperty(this, disconnectedCallback, {
            value: () => disconnectEvents.forEach(listener => listener.call(context)),
          });

          builder.elements.notify(element, context);

          const component = Component.create(componentType, context);

          Object.defineProperty(this, Component.symbol, { value: component });

          componentResolver.resolve(component);
        } catch (error) {
          componentResolver.reject(error);
          throw error;
        }
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

    return Element as ElementClass<any>;
  }

}
