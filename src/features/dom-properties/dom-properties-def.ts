import { MetaAccessor } from '../../common';
import { ComponentType } from '../../component';
import { FeatureDef } from '../../feature';
import { DomPropertiesSupport } from './dom-properties-support';

/**
 * Custom HTML element (DOM) properties definition.
 *
 * This is a map of property descriptors.
 */
export type DomPropertiesDef = PropertyDescriptorMap;

export namespace DomPropertiesDef {

  /**
   * A key of a property holding a DOM properties definition within web component's class constructor.
   */
  export const symbol = Symbol('web-component-properties');

  class DomPropertiesMeta extends MetaAccessor<DomPropertiesDef> {

    constructor() {
      super(DomPropertiesDef.symbol);
    }

    merge(...defs: DomPropertiesDef[]): DomPropertiesDef {
      return Object.assign({}, ...defs);
    }

  }

  const meta = new DomPropertiesMeta();

  /**
   * Extracts DOM properties definition from web component type.
   *
   * @param <T> A type of web component.
   * @param componentType Target web component type.
   *
   * @returns DOM properties attributes definition. May be empty when there is no definition found in the given
   * `componentType`.
   */
  export function of<T extends object>(componentType: ComponentType<T>): DomPropertiesDef {
    return meta.of(componentType) || {};
  }

  /**
   * Merges multiple DOM properties definitions.
   *
   * @param defs DOM properties definitions to merge.
   *
   * @returns Merged DOM properties definition.
   */
  export function merge(...defs: DomPropertiesDef[]): DomPropertiesDef {
    return meta.merge(...defs);
  }

  /**
   * Defines a custom HTML element attributes.
   *
   * Either assigns new or extends an existing DOM properties definition and stores it under `DomPropertiesDef.symbol`
   * key.
   *
   * @param <T> A type of web component.
   * @param type Target web component type.
   * @param defs DOM properties definitions to apply.
   *
   * @returns The `type` instance.
   */
  export function define<T extends ComponentType>(type: T, ...defs: DomPropertiesDef[]): T {
    FeatureDef.define(type, { requires: [DomPropertiesSupport] });
    return meta.define(type, ...defs);
  }

}
