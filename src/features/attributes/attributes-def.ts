import { ComponentElementType, ComponentType } from '../../component';
import { mergeFunctions, superClass } from '../../util';

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

/**
 * Web component type supporting attributes.
 *
 * It may contain a property with `AttributesDef.symbol` as its key containing attributes definition.
 *
 * @param <T> A type of web component.
 * @param <E> A type of HTML element this web component extends.
 */
export interface ComponentWithAttributesType<
    T extends object = object,
    E extends HTMLElement = ComponentElementType<T>> extends ComponentType<T, E> {
  [AttributesDef.symbol]?: AttributesDef<T>;
}

export namespace AttributesDef {

  /**
   * A key of a property holding a attributes definition within web component's class constructor.
   */
  export const symbol = Symbol('web-component-attributes');

  /**
   * Extracts attributes definition definition from web component type.
   *
   * @param <T> A type of web component.
   * @param componentType Target component type.
   *
   * @returns Web component attributes definition. May be empty when there is no feature definition found in the given
   * `componentType`.
   */
  export function of<T extends object, E extends HTMLElement>(
      componentType: ComponentWithAttributesType<T, E>): AttributesDef<T> {

    const def = componentType[AttributesDef.symbol];
    const superType = superClass(componentType, st => AttributesDef.symbol in st) as ComponentType<any, any>;
    const superDef = superType && AttributesDef.of(superType);

    if (!def) {
      return {};
    }

    return superDef && superDef !== def ? AttributesDef.merge(superDef, def) : def;
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
