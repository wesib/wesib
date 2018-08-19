import { AttributeDefs, ComponentContext, ComponentDef, ComponentType, definitionOf } from '../component';
import { componentRef, ElementClass } from './element';

const WINDOW = window;

/**
 * @internal
 */
export class ElementBuilder {

  constructor(readonly window: Window = WINDOW) {
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

    class Element extends elementType {

      // noinspection JSUnusedGlobalSymbols
      static readonly observedAttributes = def.attributes && Object.keys(attrs);

      // Component reference
      [componentRef]: T;

      constructor() {
        super();

        const context: ComponentContext<E> = {
          element: this as any,
          elementSuper: (name: string) => {
            // @ts-ignore
            return super[name] as any;
          }
        };

        this[componentRef] = new componentType(context);
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
