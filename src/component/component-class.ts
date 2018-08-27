import { Class } from '../types';
import { ComponentContext } from './component-context';

/**
 * Web component class constructor.
 *
 * Constructor may accept a component context instance as the only parameter.
 *
 * @param <T> A type of web component.
 * @param <E> A type of compatible custom HTML element.
 */
export interface ComponentClass<T extends object = object, E extends HTMLElement = HTMLElement> extends Function {
  new (context: ComponentContext<T, E>): T;
  prototype: T;
}

/**
 * HTML element type corresponding to the given component class.
 *
 * @param <T> A type of web component.
 */
export type ComponentElementType<T extends object> = Class<T> extends ComponentClass<T, infer E> ? E : HTMLElement;
