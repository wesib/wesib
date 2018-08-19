import { ComponentDefinitionListener, ElementDefinitionListener } from '../api';
import { ComponentElementType, ComponentType, definitionOf } from '../component';
import { Disposable } from '../types';
import { ElementClass } from './element';
import { ElementBuilder } from './element-builder';

/**
 * @internal
 */
export class ComponentRegistry {

  readonly builder: ElementBuilder;
  private readonly _componentDefinitionListeners: ComponentDefinitionListener[] = [];
  private readonly _elementDefinitionListeners: ElementDefinitionListener[] = [];

  static create(opts: {
    builder: ElementBuilder
  }): ComponentRegistry {
    return new ComponentRegistry(opts);
  }

  private constructor(
      {
        builder,
      }: {
        builder: ElementBuilder
      }) {
    this.builder = builder;
  }

  get window(): Window {
    return this.builder.window;
  }

  define<T extends object>(componentType: ComponentType<T>): ElementClass<ComponentElementType<T>> {
    componentType = this._componentDefined(componentType);

    const def = definitionOf(componentType);
    const elementClass = this._elementDefined(this.builder.buildElement(componentType), componentType);
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

  private _componentDefined<T extends object>(componentType: ComponentType<T>): ComponentType<T> {
    return this._componentDefinitionListeners.reduce(
        (type, listener) => listener(type) || type,
        componentType);
  }

  onElementDefinition(listener: ElementDefinitionListener): Disposable {
    this._elementDefinitionListeners.push(listener);
    return {
      dispose: () => {

        const idx = this._elementDefinitionListeners.indexOf(listener);

        if (idx >= 0) {
          this._elementDefinitionListeners.splice(idx, 1);
        }
      }
    };
  }

  private _elementDefined<T extends object, E extends HTMLElement>(
      elementType: ElementClass<E>,
      componentType: ComponentType<T, E>): ElementClass<E> {
    return this._elementDefinitionListeners.reduce(
        (type, listener) => listener(type, componentType) || type,
        elementType);
  }

}
