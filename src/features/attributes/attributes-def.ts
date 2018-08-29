import { mergeFunctions, MetaAccessor } from '../../common';
import { ComponentType } from '../../component';
import { FeatureDef } from '../../feature';
import { AttributesSupport } from './attributes-support.feature';

/**
 * Custom HTML element (DOM) attributes definition.
 *
 * This is a map containing attribute names as keys and their change callbacks as values.
 *
 * @param <T> A type of web component.
 */
export interface AttributesDef<T extends object = object> {
  [name: string]: AttributeChangedCallback<T>;
}

/**
 * Custom HTML element attribute change callback.
 *
 * This function is called whenever a new attribute value assigned.
 *
 * @param <T> A type of web component.
 * @param this Web component instance.
 * @param oldValue Previous attribute value, or `null` if there were no value assigned.
 * @param newValue New attribute value.
 */
export type AttributeChangedCallback<T extends object = object> = (this: T, oldValue: string, newValue: string) => void;

export namespace AttributesDef {

  /**
   * A key of a property holding a attributes definition within web component's class constructor.
   */
  export const symbol = Symbol('web-component-attributes');

  class AttributesMeta extends MetaAccessor<AttributesDef<any>> {

    constructor() {
      super(AttributesDef.symbol);
    }

    merge<T extends object = object>(...defs: AttributesDef<T>[]): AttributesDef<T> {
      return defs.reduce(
          (prev, def) => {

            const result: AttributesDef<T> = { ...prev };

            Object.keys(def).forEach(key => {
              result[key] = mergeFunctions<T, [string, string], void>(result[key], def[key]);
            });

            return result;
          },
          {});
    }

  }

  const meta = new AttributesMeta();

  /**
   * Extracts attributes definition from web component type.
   *
   * @param <T> A type of web component.
   * @param componentType Target component type.
   *
   * @returns Attributes definition. May be empty when there is no definition found in the given `componentType`.
   */
  export function of<T extends object>(componentType: ComponentType<T>): AttributesDef<T> {
    return (meta.of(componentType) || {}) as AttributesDef<T>;
  }

  /**
   * Merges multiple attributes definitions.
   *
   * @param <T> A type of web component.
   * @param defs Attributes definitions to merge.
   *
   * @returns Merged attributes definition.
   */
  export function merge<T extends object = object>(...defs: AttributesDef<T>[]): AttributesDef<T> {
    return meta.merge(...defs);
  }

  /**
   * Defines a custom HTML element attributes.
   *
   * Either assigns new or extends an existing attributes definition and stores it under `AttributesDef.symbol` key.
   *
   * Automatically enables `AttributesSupport` feature.
   *
   * @param <T> A type of web component.
   * @param type Target web component type.
   * @param defs Attributes definitions to apply.
   *
   * @returns The `type` instance.
   */
  export function define<T extends ComponentType>(type: T, ...defs: AttributesDef<InstanceType<T>>[]): T {
    FeatureDef.define(type, { requires: [AttributesSupport] });
    return meta.define(type, ...defs);
  }

}
