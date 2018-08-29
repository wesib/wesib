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

}
