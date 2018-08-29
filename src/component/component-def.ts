import { ElementClass } from '../element';
import { ComponentElementType } from './component-type';

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
   * The class constructor of HTML element to extend.
   */
  type: ElementClass<E>;

  /**
   * The name of HTML element to extend.
   *
   * This is to support `as` attribute of standard HTML element. Note that this is not supported by polyfills.
   */
  name?: string;

}

export namespace ComponentDef {

  /**
   * A key of a property holding a web component definition within its class constructor.
   */
  export const symbol = Symbol('web-component-def');

}
