import {
  AttributeDefs,
  ComponentContext,
  ComponentDef,
  ComponentType,
  ComponentValueKey,
  definitionOf,
} from '../component';
import { componentRef, ElementClass } from './element';
import { ProviderRegistry } from './provider-registry';

const WINDOW = window;

/**
 * @internal
 */
export class ElementBuilder {

  readonly window: Window;
  readonly providerRegistry: ProviderRegistry;

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

    const Object = (this.window as any).Object;
    const def = definitionOf(componentType);
    const elementType: ElementClass<HTMLElement> = this.elementType(def);
    const attrs: AttributeDefs<T> = { ...def.attributes };
    const providerRegistry = this.providerRegistry;

    class Element extends elementType {

      // noinspection JSUnusedGlobalSymbols
      static readonly observedAttributes = def.attributes && Object.keys(attrs);

      // Component reference
      [componentRef]: T;

      constructor() {
        super();

        const element: E = this as any;
        // @ts-ignore
        const elementSuper = (name: string) => super[name] as any;
        const values = new Map<ComponentValueKey<any>, any>();

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
        }

        Object.defineProperty(this, componentRef, {
          value: new componentType(new Context()),
        });
      }

      // noinspection JSUnusedGlobalSymbols
      attributeChangedCallback(name: string, oldValue: string | string, newValue: string) {
        attrs[name].call(this[componentRef], oldValue, newValue);
      }

    }

    if (def.properties) {
      Object.defineProperties(Element.prototype, def.properties);
    }

    return Element as ElementClass<any>;
  }

}
