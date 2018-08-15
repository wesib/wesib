/**
 * Custom element reference.
 *
 * Represents an element created for web component in accordance to its definition.
 *
 * Such reference is passed to component constructor as its only parameter.
 *
 * @param <T> A type of HTML element.
 */
export interface ElementRef<HTE extends HTMLElement = HTMLElement> {
  readonly element: HTE;
  inherited(name: string): any;
}

/**
 * Web component class constructor.
 *
 * Constructor may accept a custom HTML element reference as the only parameter.
 *
 * @param <T> A type of web component.
 * @param <HTE> A type of compatible custom HTML element.
 */
export interface ComponentClass<T extends object = object, HTE extends HTMLElement = HTMLElement> extends Function {
  new (elementRef: ElementRef<HTE>): T;
  prototype: T;
}

/**
 * HTML element type corresponding to the given component class.
 *
 * @param <T> A type of web component.
 */
export type ComponentElementType<T extends object> =
    T extends ComponentClass<T, infer HTE> ? HTE : HTMLElement;

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
