import { Class } from '../types';

/**
 * Custom element reference.
 *
 * Represents an element created for web component in accordance to its definition.
 *
 * Such reference is passed to component constructor as its only parameter.
 *
 * @param <E> A type of HTML element.
 */
export interface ElementRef<E extends HTMLElement = HTMLElement> {
  readonly element: E;
  inherited(name: string): any;
}

/**
 * Web component class constructor.
 *
 * Constructor may accept a custom HTML element reference as the only parameter.
 *
 * @param <T> A type of web component.
 * @param <E> A type of compatible custom HTML element.
 */
export interface ComponentClass<T extends object = object, E extends HTMLElement = HTMLElement> extends Function {
  new (elementRef: ElementRef<E>): T;
  prototype: T;
}

/**
 * HTML element type corresponding to the given component class.
 *
 * @param <T> A type of web component.
 */
export type ComponentElementType<T extends object> = Class<T> extends ComponentClass<T, infer E> ? E : HTMLElement;

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
