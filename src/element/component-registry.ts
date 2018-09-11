import { Class, EventEmitter } from '../common';
import { ComponentClass, ComponentDef } from '../component';
import { BootstrapContext, ComponentDefinitionListener, ElementDefinitionListener } from '../feature';
import { ElementBuilder } from './element-builder';

/**
 * @internal
 */
export class ComponentRegistry {

  readonly builder: ElementBuilder;
  readonly componentDefinitions = new EventEmitter<ComponentDefinitionListener>();
  readonly elementDefinitions = new EventEmitter<ElementDefinitionListener>();
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

  get customElements(): CustomElementRegistry {
    return this.builder.bootstrapContext.get(BootstrapContext.customElementsKey);
  }

  define<T extends object>(componentType: ComponentClass<T>) {
    this._define(() => {
      componentType = this._componentDefined(componentType);

      const def = ComponentDef.of(componentType);
      const elementClass = this._elementDefined(this.builder.buildElement(componentType), componentType);
      const ext = def.extend;

      if (ext && ext.name) {
        this.customElements.define(
            def.name,
            elementClass,
            {
              extends: ext.name,
            });
      } else {
        this.customElements.define(def.name, elementClass);
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

  whenDefined(componentType: ComponentClass<any>): PromiseLike<void> {
    return this.customElements.whenDefined(ComponentDef.of(componentType).name);
  }

  private _componentDefined<T extends object>(componentType: ComponentClass<T>): ComponentClass<T> {
    return this.componentDefinitions.reduce(
        (type, listener) => listener(componentType) || type,
        componentType);
  }

  private _elementDefined<T extends object>(
      elementType: Class,
      componentType: ComponentClass<T>): Class {
    return this.elementDefinitions.reduce(
        (type, listener) => listener(elementType, componentType) || type,
        elementType);
  }

}
