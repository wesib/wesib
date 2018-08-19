import { ElementClass } from '../element';
import { ComponentElementType } from './component';

/**
 * A symbol that is used as a key for a property holding a web component definition within its class constructor.
 */
export const componentDef = Symbol('web-component-def');

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

  /**
   * Custom HTML element attributes.
   *
   * These attributes will be supported by the custom HTML element.
   */
  attributes?: AttributeDefs<T>;

}

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

/**
 * Custom HTML element attributes definitions.
 *
 * This is a map containing attribute names as keys and their definitions as values.
 */
export interface AttributeDefs<T extends object = object> {
  [name: string]: AttributeDef<T>;
}

/**
 * Custom HTML element attribute definition.
 *
 * This is a function that will be called whenever a new attribute value assigned.
 *
 * @param <T> A type of web component.
 * @param this Web component instance.
 * @param oldValue Previous attribute value, or `null` if there were no value assigned.
 * @param newValue New attribute value.
 */
export type AttributeDef<T extends object = object> = (this: T, oldValue: string, newValue: string) => void;

/**
 * Merges multiple web component (partial) definitions.
 *
 * @param <T> A type of web component.
 * @param <E> A type of HTML element this web component extends.
 * @param defs Partial web component definitions to merge.
 */
export function mergeComponentDefs<
    T extends object = object,
    E extends HTMLElement = HTMLElement>(...defs: Partial<ComponentDef<T, E>>[]):
    Partial<ComponentDef<T, E>> {
  return defs.reduce(
      (prev, def) => {

        const result: Partial<ComponentDef<T, E>> = {
          ...prev,
          ...def,
        };

        if (prev.properties || def.properties) {
          result.properties = {
            ...prev.properties,
            ...def.properties,
          };
        }
        if (prev.attributes || def.attributes) {
          result.attributes = {
            ...prev.attributes,
            ...def.attributes,
          };
        }

        return result;
      },
      {});
}
