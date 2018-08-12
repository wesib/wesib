import {
  ComponentDef,
  ComponentElementType,
  componentRef,
  ComponentType,
  definitionOf,
  ElementRef,
} from '../component';
import { ElementClass } from './element';

const WINDOW = window;

export class ElementBuilder {

  constructor(readonly window: Window = WINDOW) {
  }

  elementType<HTE extends HTMLElement = HTMLElement>(def: ComponentDef<HTE>): ElementClass<HTE> {
    return def.extend && def.extend.type || ((this.window as any).HTMLElement as ElementClass<HTE>);
  }

  buildElement<T extends object>(
      componentType: ComponentType<T>):
      ElementClass<ComponentElementType<T>> {

    const def = definitionOf(componentType) as ComponentDef<any>;
    const elementType = this.elementType(def);

    class Element extends elementType {

      [componentRef]: T;

      constructor() {
        super();

        const elementRef: ElementRef<ComponentElementType<T>> = {
          element: this as any,
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
