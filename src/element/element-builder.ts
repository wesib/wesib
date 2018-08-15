import { AttributeDefs, ComponentDef, componentRef, ComponentType, definitionOf, ElementRef } from '../component';
import { ElementClass } from './element';

const WINDOW = window;

/**
 * @internal
 */
export class ElementBuilder {

  constructor(readonly window: Window = WINDOW) {
  }

  elementType<T extends object = object, HTE extends HTMLElement = HTMLElement>(
      def: ComponentDef<T, HTE>):
      ElementClass<HTE> {
    return def.extend && def.extend.type || ((this.window as any).HTMLElement as ElementClass<HTE>);
  }

  buildElement<T extends object, HTE extends HTMLElement>(
      componentType: ComponentType<T, HTE>):
      ElementClass<HTE> {

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

        const elementRef: ElementRef<HTE> = {
          element: this as any,
          inherited: (name: string) => {
            // @ts-ignore
            return super[name] as any;
          }
        };

        this[componentRef] = new componentType(elementRef);
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
