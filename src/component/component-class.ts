import { ComponentContext } from './component-context';

/**
 * Component class constructor.
 *
 * Constructor may accept a component context instance as the only parameter.
 *
 * @typeparam T A type of component.
 */
export interface ComponentClass<T extends object = any> extends Function {
  new (context: ComponentContext<T>): T;
  prototype: T;
}
