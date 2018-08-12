import {
  ComponentDesc,
  componentDesc,
  ComponentElementType,
  componentRef,
  ComponentType,
  ElementRef,
} from '../component';
import { ElementClass } from './element';

const WINDOW = window;

export class ElementBuilder {

  constructor(readonly window: Window = WINDOW) {
  }

  elementType<HTE extends HTMLElement = HTMLElement>(desc: ComponentDesc<HTE>): ElementClass<HTE> {
    return desc.extend && desc.extend.type || ((this.window as any).HTMLElement as ElementClass<HTE>);
  }

  buildElement<T extends object>(
      componentType: ComponentType<T>):
      ElementClass<ComponentElementType<T>> {

    const desc = componentType[componentDesc] as ComponentDesc<HTMLElement>;
    const elementType = this.elementType(desc);

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

    if (desc.properties) {
      (this.window as any).Object.defineProperties(Element.prototype, desc.properties);
    }

    return Element as ElementClass<any>;
  }

}
