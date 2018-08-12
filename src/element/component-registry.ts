import { ComponentElementType, ComponentType, descriptorOf } from '../component';
import { ElementClass } from './element';
import { ElementBuilder } from './element-builder';

const WINDOW = window;

export class ComponentRegistry {

  readonly window: Window;
  readonly builder: ElementBuilder;

  constructor(
      {
        window = WINDOW,
        builder = new ElementBuilder(window),
      }: {
        window?: Window,
        builder?: ElementBuilder
      } = {}) {
    this.window = window;
    this.builder = builder;
  }

  define<T extends object>(componentType: ComponentType<T>): ElementClass<ComponentElementType<T>> {

    const desc = descriptorOf(componentType);
    const elementClass = this.builder.buildElement(componentType);
    const ext = desc.extend;

    if (ext) {
      this.window.customElements.define(
          desc.name,
          elementClass,
          {
            extends: ext.name,
          });
    } else {
      this.window.customElements.define(desc.name, elementClass);
    }

    return elementClass;
  }

  whenDefined(componentType: ComponentType<any, any>): PromiseLike<void> {
    return this.window.customElements.whenDefined(descriptorOf(componentType).name);
  }

}
