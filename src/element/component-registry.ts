import { ComponentDefinitionListener } from '../api';
import { ComponentElementType, ComponentType, definitionOf } from '../component';
import { Disposable } from '../types';
import { ElementClass } from './element';
import { ElementBuilder } from './element-builder';

const WINDOW = window;

/**
 * @internal
 */
export class ComponentRegistry {

  readonly window: Window;
  readonly builder: ElementBuilder;
  private readonly _componentDefinitionListeners: ComponentDefinitionListener[] = [];

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
    componentType = this._componentDefined(componentType);

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

  private _componentDefined<T extends object>(componentType: ComponentType<T>): ComponentType<T> {
    return this._componentDefinitionListeners.reduce((type, listener) => listener(type) || type, componentType);
  }

  whenDefined(componentType: ComponentType<any, any>): PromiseLike<void> {
    return this.window.customElements.whenDefined(definitionOf(componentType).name);
  }

  onComponentDefinition(listener: ComponentDefinitionListener): Disposable {
    this._componentDefinitionListeners.push(listener);
    return {
      dispose: () => {

        const idx = this._componentDefinitionListeners.indexOf(listener);

        if (idx >= 0) {
          this._componentDefinitionListeners.splice(idx, 1);
        }
      }
    };
  }

}
