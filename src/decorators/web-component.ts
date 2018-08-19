import { ComponentDef, defineComponent } from '../component';
import { Class } from '../types';
import { ComponentDecorator } from './component-decorators';

/**
 * Web component class decorator.
 *
 * Decorate a class with it to define it as a web component like this:
 * ```TypeScript
 * @WebComponent({ name: 'my-element' })
 * class MyComponent {
 *   // ...
 * }
 * ```
 *
 * Such component can be registered with `components.define()`
 * method prior in order to be recognized by HTML document.
 *
 * This is an alternative to direct call to `defineComponent()` method.
 *
 * @param <T> A type of web component.
 * @param <E> A type of HTML element this web component extends.
 * @param def Web component definition.
 *
 * @returns A web component class decorator.
 */
export function WebComponent<
    T extends Class = Class<any>,
    E extends HTMLElement = HTMLElement>(def: ComponentDef<InstanceType<T>, E>): ComponentDecorator<T> {
  return (type: T) => defineComponent(type, def);
}
