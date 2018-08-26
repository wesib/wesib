import { ElementClass } from '../element';
import { ComponentElementType } from './component-class';

/**
 * Web component definition.
 *
 * A custom HTML element class will be created for each registered web component in accordance to this definition.
 *
 * @param <T> A type of web component.
 * @param <E> A type of HTML element this web component extends.
 */
export interface ComponentDef<T extends object = object, E extends HTMLElement = ComponentElementType<T>> {

  /**
   * Custom HTML element name.
   */
  name: string;

  /**
   * Standard HTML element the component extends.
   */
  extend?: ExtendedElementDef<E>;

  /**
   * Custom HTML element properties definitions.
   *
   * These properties will be defined in custom HTML element class prototype.
   */
  properties?: PropertyDescriptorMap;

}

/**
 * Partial component definition.
 *
 * @param <T> A type of web component.
 * @param <E> A type of HTML element this web component extends.
 */
export type PartialComponentDef<T extends object = object, E extends HTMLElement = ComponentElementType<T>> =
    Partial<ComponentDef<T, E>>;

/**
 * Standard HTML element to extend by custom HTML element.
 */
export interface ExtendedElementDef<E extends HTMLElement> {

  /**
   * HTML element class constructor to extend.
   */
  type: ElementClass<E>;

  /**
   * HTML element name to extend.
   */
  name: string;

}

export namespace ComponentDef {

  /**
   * A key of a property holding a web component definition within its class constructor.
   */
  export const symbol = Symbol('web-component-def');

  /**
   * Merges multiple web component (partial) definitions.
   *
   * @param <T> A type of web component.
   * @param <E> A type of HTML element this web component extends.
   * @param defs Partial web component definitions to merge.
   *
   * @returns Merged component definition.
   */
  export function merge<
      T extends object = object,
      E extends HTMLElement = HTMLElement>(...defs: PartialComponentDef<T, E>[]):
      PartialComponentDef<T, E> {
    return defs.reduce(
        (prev, def) => {

          const result: PartialComponentDef<T, E> = {
            ...prev,
            ...def,
          };

          if (prev.properties || def.properties) {
            result.properties = {
              ...prev.properties,
              ...def.properties,
            };
          }

          return result;
        },
        {});
  }

}
