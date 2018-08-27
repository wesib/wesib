import { mergeFunctions, MetaAccessor } from '../../common';
import { ComponentType } from '../../component';
import { Class } from '../../types';

/**
 * Custom HTML element attributes definition.
 *
 * This is a map containing attribute names as keys and their change callbacks as values.
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
   * Extracts attributes definition definition from web component type.
   *
   * @param <T> A type of web component.
   * @param componentType Target component type.
   *
   * @returns Web component attributes definition. May be empty when there is no feature definition found in the given
   * `componentType`.
   */
  export function of<T extends object>(componentType: ComponentType<T>): AttributesDef<T> {
    return (meta.of(componentType) || {}) as AttributesDef<T>;
  }

  /**
   * Merges multiple web component attributes definitions.
   *
   * @param <T> A type of web component.
   * @param defs Partial web component definitions to merge.
   *
   * @returns Merged component definition.
   */
  export function merge<T extends object = object>(...defs: AttributesDef<T>[]): AttributesDef<T> {
    return meta.merge(...defs);
  }

  /**
   * Defines a web component attributes.
   *
   * Either assigns new or extends an existing component attributes definition and stores it under
   * `AttributesDef.symbol` key.
   *
   * @param <T> A type of web component.
   * @param type Web component class constructor.
   * @param defs Web component definitions.
   *
   * @returns The `type` instance.
   */
  export function define<T extends ComponentType>(type: T, ...defs: AttributesDef<InstanceType<T>>[]): T {
    return meta.define(type, ...defs) as T;
  }

}
