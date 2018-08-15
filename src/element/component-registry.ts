import { ComponentElementType, ComponentType, definitionOf } from '../component';
import { ElementClass } from './element';
import { ElementBuilder } from './element-builder';

const WINDOW = window;

/**
 * @internal
 */
export class ComponentRegistry {

  readonly window: Window;
  readonly builder: ElementBuilder;

  static create(opts?: {
    window?: Window,
    builder?: ElementBuilder
  }): ComponentRegistry {
    return new ComponentRegistry(opts);
  }

  private constructor(
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

    const def = definitionOf(componentType);
    const elementClass = this.builder.buildElement(componentType);
    const ext = def.extend;

    if (ext) {
      this.window.customElements.define(
          def.name,
          elementClass,
          {
            extends: ext.name,
          });
    } else {
      this.window.customElements.define(def.name, elementClass);
    }

    return elementClass;
  }

  whenDefined(componentType: ComponentType<any, any>): PromiseLike<void> {
    return this.window.customElements.whenDefined(definitionOf(componentType).name);
  }

}
