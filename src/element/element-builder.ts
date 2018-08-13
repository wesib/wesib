import { ComponentDef, componentRef, ComponentType, definitionOf, ElementRef } from '../component';
import { ElementClass } from './element';

const WINDOW = window;

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

    const def = definitionOf(componentType);
    const elementType: ElementClass<HTMLElement> = this.elementType(def);

    class Element extends elementType {

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

    }

    if (def.properties) {
      (this.window as any).Object.defineProperties(Element.prototype, def.properties);
    }

    return Element as ElementClass<any>;
  }

}
