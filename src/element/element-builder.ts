import { EventEmitter } from '../common';
import {
  Component,
  ComponentContext,
  ComponentDef,
  ComponentElementType,
  ComponentType,
  ComponentValueKey,
} from '../component';
import { ElementListener } from '../feature';
import { PromiseResolver } from '../util';
import { ElementClass } from './element';
import { ProviderRegistry } from './provider-registry';

const WINDOW = window;

/**
 * @internal
 */
export class ElementBuilder {

  readonly window: Window;
  readonly providerRegistry: ProviderRegistry;
  readonly elements = new EventEmitter<ElementListener>();

  static create(opts: { window?: Window, providerRegistry: ProviderRegistry }): ElementBuilder {
    return new ElementBuilder(opts);
  }

  private constructor(
      {
        window = WINDOW,
        providerRegistry,
      }: {
        window?: Window,
        providerRegistry: ProviderRegistry,
      }) {
    this.window = window;
    this.providerRegistry = providerRegistry;
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
    const providerRegistry = this.providerRegistry;

    class Element extends elementType {

      // Component reference
      [Component.symbol]: T;

      // Component context reference
      [ComponentContext.symbol]: ComponentContext<T, ComponentElementType<T>>;

      private readonly _connectedCallback!: () => void;
      private readonly _disconnectedCallback!: () => void;

      constructor() {
        super();

        const componentResolver = new PromiseResolver<T>();

        try {

          const element: ComponentElementType<T> = this;
          // @ts-ignore
          const elementSuper = (name: string) => super[name] as any;
          const values = new Map<ComponentValueKey<any>, any>();
          const connectEvents = new EventEmitter<(this: Context) => void>();
          const disconnectEvents = new EventEmitter<(this: Context) => void>();

          class Context implements ComponentContext<T, ComponentElementType<T>> {

            readonly element = element;
            readonly component = componentResolver.promise;
            readonly elementSuper = elementSuper;
            readonly onConnect = connectEvents.on;
            readonly onDisconnect = disconnectEvents.on;

            get<V>(key: ComponentValueKey<V>, defaultValue: V | null | undefined): V | null | undefined {

              const cached: V | undefined = values.get(key);

              if (cached != null) {
                return cached;
              }

              const constructed = providerRegistry.get(key, this);

              if (constructed != null) {
                values.set(key, constructed);
                return constructed;
              }
              if (arguments.length > 1) {
                return defaultValue;
              }
              if (key.defaultValue !== undefined) {
                return key.defaultValue;
              }

              throw new Error(`There is no value with the key ${key}`);
            }

          }

          const context = new Context();

          Object.defineProperty(this, ComponentContext.symbol, { value: context });
          Object.defineProperty(this, '_connectedCallback', {
            value: () => connectEvents.forEach(listener => listener.call(context)),
          });
          Object.defineProperty(this, '_disconnectedCallback', {
            value: () => disconnectEvents.forEach(listener => listener.call(context)),
          });

          builder.elements.notify(element, context);

          const component = new componentType(context);

          Object.defineProperty(component, ComponentContext.symbol, { value: context });
          Object.defineProperty(this, Component.symbol, { value: component });

          componentResolver.resolve(component);
        } catch (error) {
          componentResolver.reject(error);
          throw error;
        }
      }

      // noinspection JSUnusedGlobalSymbols
      connectedCallback() {
        this._connectedCallback();
      }

      // noinspection JSUnusedGlobalSymbols
      disconnectedCallback() {
        this._disconnectedCallback();
      }

    }

    return Element as ElementClass<any>;
  }

}
