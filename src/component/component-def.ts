import { Class } from '../common';

/**
 * Component definition.
 *
 * A custom element class will be created for each registered component in accordance to this definition.
 *
 * @param <T> A type of component.
 */
export interface ComponentDef<T extends object = object> {

  /**
   * Custom element name.
   */
  name: string;

  /**
   * Existing element to extend by custom one.
   */
  extend?: ExtendedElementDef;

}

/**
 * Partial component definition.
 *
 * @param <T> A type of component.
 */
export type PartialComponentDef<T extends object = object> = Partial<ComponentDef<T>>;

/**
 * The definition of element to extend by custom one.
 */
export interface ExtendedElementDef {

  /**
   * The class constructor of element to extend.
   */
  type: Class;

  /**
   * The name of element to extend.
   *
   * This is to support `as` attribute of standard HTML element. Note that this is not supported by polyfills.
   */
  name?: string;

}

export namespace ComponentDef {

  /**
   * A key of a property holding a component definition within its class constructor.
   */
  export const symbol = Symbol('component-def');

}
