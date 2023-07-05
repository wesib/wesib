/* eslint-disable @typescript-eslint/ban-types */
import { ComponentContext, ComponentInstance } from '../component-context';

/**
 * Component class constructor.
 *
 * Constructor may accept a component context instance as the only parameter.
 *
 * @category Core
 * @typeParam T - A type of component.
 */
export interface ComponentClass<T extends object = any> extends Function {
  new (context: ComponentContext<T>): ComponentInstance<T>;
  prototype: ComponentInstance<T>;
}
