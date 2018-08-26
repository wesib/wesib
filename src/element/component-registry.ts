import { ComponentDef, ComponentType } from '../component';
import { ComponentDefinitionListener, ElementDefinitionListener } from '../feature';
import { Disposable } from '../types';
import { Listeners } from '../util';
import { ElementClass } from './element';
import { ElementBuilder } from './element-builder';

/**
 * @internal
 */
export class ComponentRegistry {

  readonly builder: ElementBuilder;
  private readonly _componentDefinitionListeners = new Listeners<ComponentDefinitionListener>();
  private readonly _elementDefinitionListeners = new Listeners<ElementDefinitionListener>();
  private _definitions: (() => void)[] = [];

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

  define<T extends object>(componentType: ComponentType<T>) {
    this._define(() => {
      componentType = this._componentDefined(componentType);

      const def = ComponentDef.of(componentType);
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
    });
  }

  private _define(definition: () => void) {
    this._definitions.push(definition);
  }

  complete() {
    this._definitions.forEach(definition => definition());
    delete this._definitions;
  }

  whenDefined(componentType: ComponentType<any, any>): PromiseLike<void> {
    return this.window.customElements.whenDefined(ComponentDef.of(componentType).name);
  }

  onComponentDefinition(listener: ComponentDefinitionListener): Disposable {
    return this._componentDefinitionListeners.register(listener);
  }

  private _componentDefined<T extends object>(componentType: ComponentType<T>): ComponentType<T> {
    this._componentDefinitionListeners.forEach(
        listener => {
          componentType = listener(componentType) || componentType;
        });
    return componentType;
  }

  onElementDefinition(listener: ElementDefinitionListener): Disposable {
    return this._elementDefinitionListeners.register(listener);
  }

  private _elementDefined<T extends object, E extends HTMLElement>(
      elementType: ElementClass<E>,
      componentType: ComponentType<T, E>): ElementClass<E> {
    this._elementDefinitionListeners.forEach(listener => {
      elementType = listener(elementType, componentType) || elementType;
    });
    return elementType;
  }

}
