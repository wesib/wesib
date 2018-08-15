/**
 * HTML element class constructor.
 *
 * Such constructor should not accept any parameters.
 */
export interface ElementClass<T extends HTMLElement = HTMLElement> extends Function {
  new(): T;
  prototype: T;
}
