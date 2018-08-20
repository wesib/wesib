import { ElementListener } from '../api';
import {
  AttributeDefs,
  Component,
  ComponentContext,
  ComponentDef,
  ComponentType,
  ComponentValueKey,
} from '../component';
import { Disposable } from '../types';
import { Listeners } from '../util';
import { ElementClass } from './element';
import { ProviderRegistry } from './provider-registry';

const WINDOW = window;

/**
 * @internal
 */
export class ElementBuilder {

  readonly window: Window;
  readonly providerRegistry: ProviderRegistry;
  private readonly _elementListeners = new Listeners<ElementListener>();

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

  elementType<T extends object = object, E extends HTMLElement = HTMLElement>(
      def: ComponentDef<T, E>):
      ElementClass<E> {
    return def.extend && def.extend.type || ((this.window as any).HTMLElement as ElementClass<E>);
  }

  buildElement<T extends object, E extends HTMLElement>(
      componentType: ComponentType<T, E>):
      ElementClass<E> {

    const builder = this;
    const Object = (this.window as any).Object;
    const def = ComponentDef.of(componentType);
    const elementType: ElementClass<HTMLElement> = this.elementType(def);
    const attrs: AttributeDefs<T> = { ...def.attributes };
    const providerRegistry = this.providerRegistry;

    class Element extends elementType {

      // noinspection JSUnusedGlobalSymbols
      static readonly observedAttributes = def.attributes && Object.keys(attrs);

      // Component reference
      [Component.symbol]: T;

      // Component context reference
      [ComponentContext.symbol]: ComponentContext<E>;

      private readonly _connectedCallback!: () => void;
      private readonly _disconnectedCallback!: () => void;

      constructor() {
        super();

        const element: E = this as any;
        // @ts-ignore
        const elementSuper = (name: string) => super[name] as any;
        const values = new Map<ComponentValueKey<any>, any>();
        const componentListeners = new Listeners<(this: Context) => void>();
        const connectListeners = new Listeners<(this: Context) => void>();
        const disconnectListeners = new Listeners<(this: Context) => void>();

        class Context implements ComponentContext<E> {

          readonly element = element;
          readonly elementSuper = elementSuper;

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

            if (arguments.length < 2) {
              throw new Error(`There is no value of the key ${key}`);
            }

            return defaultValue;
          }

          onComponent(listener: (this: Context) => void): Disposable {
            return componentListeners.register(listener);
          }

          onConnect(listener: (this: Context) => void): Disposable {
            return connectListeners.register(listener);
          }

          onDisconnect(listener: (this: Context) => void): Disposable {
            return disconnectListeners.register(listener);
          }

        }

        const context = new Context();

        Object.defineProperty(this, ComponentContext.symbol, { value: context });
        Object.defineProperty(this, '_connectedCallback', {
          value: () => connectListeners.forEach(listener => listener.call(context)),
        });
        Object.defineProperty(this, '_disconnectedCallback', {
          value: () => disconnectListeners.forEach(listener => listener.call(context)),
        });

        builder._elementCreated(element, context);

        const component = new componentType(context);

        Object.defineProperty(this, Component.symbol, { value: component });

        componentListeners.forEach(listener => listener.call(context));
      }

      // noinspection JSUnusedGlobalSymbols
      attributeChangedCallback(name: string, oldValue: string | string, newValue: string) {
        attrs[name].call(this[Component.symbol], oldValue, newValue);
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

    if (def.properties) {
      Object.defineProperties(Element.prototype, def.properties);
    }

    return Element as ElementClass<any>;
  }

  onElement(listener: ElementListener) {
    return this._elementListeners.register(listener);
  }

  private _elementCreated<E extends HTMLElement>(element: E, context: ComponentContext<E>) {
    return this._elementListeners.forEach(listener => listener(element, context));
  }

}
