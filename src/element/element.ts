/**
 * HTML element class constructor.
 *
 * Such constructor should not accept any parameters.
 */
export interface ElementClass<T extends HTMLElement = HTMLElement> extends Function {
  new(): T;
  prototype: T;
}

/**
 * A symbol that is used as a key for custom HTML element property holding a reference to web component instance.
 */
export const componentRef = Symbol('web-component-ref');

/**
 * Extracts a reference to the web component from custom HTML element
 *
 * @param <T> A type of web component.
 * @param element Target HTML element instance.
 *
 * @return Either a web component reference stored under `componentRef` key, or `undefined` if the given `element` is
 * not a custom element constructed for the web component.
 */
export function componentOf<T extends object>(element: HTMLElement): T | undefined {
  return (element as any)[componentRef];
}
