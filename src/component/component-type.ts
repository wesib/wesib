import { Class } from '../common';
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

/**
 * Web component type.
 *
 * This is a web component class constructor that may accept a component context instance as the only parameter.
 *
 * Web component type should contain a property with `[ComponentDef.symbol]` as its key containing a web component
 * definition. This is the only requirement for the web component classes.
 *
 * @param <T> A type of web component.
 * @param <E> A type of HTML element this web component extends.
 */
export interface ComponentType<T extends object = object, E extends HTMLElement = ComponentElementType<T>>
    extends ComponentClass<T, E> {
}
