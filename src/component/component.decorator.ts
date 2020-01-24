/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { ComponentDef, ComponentDef__symbol } from './component-def';
import { ComponentClass } from './definition';

/**
 * Component decorator interface.
 *
 * In addition to being a decorator for component class, it may also serve as {@link ComponentDef component definition}.
 * Thus it can be added as parameter to {@link Component @Component} decorator, or used as class decorator by itself.
 *
 * Constructed by [[Component]] function.
 *
 * @category Core
 * @typeparam T  A type of decorated component class.
 */
export type ComponentDecorator<T extends ComponentClass = any> =
    & ((this: void, type: T) => T | void)
    & ComponentDef<InstanceType<T>>;

/**
 * Decorator of component class.
 *
 * Decorate a class with this decorator to define a component like this:
 * ```TypeScript
 * @Component({ name: 'my-element' })
 * class MyComponent {
 *   // ...
 * }
 * ```
 *
 * Such component can be registered with [[FeatureContext.define]] method or used as a feature, e.g. passed to
 * [[bootstrapComponents]] function, or added to [[FeatureDef.Options.needs]] property of another feature.
 *
 * This is an alternative to direct call to [[ComponentDef.Options.define]] method.
 *
 * @category Core
 * @typeparam T  A type of decorated component class.
 * @param defs  Component definitions.
 *
 * @returns A component class decorator.
 */
export function Component<T extends ComponentClass = any>(
    ...defs: ComponentDef<InstanceType<T>>[]
): ComponentDecorator<T> {

  const decorator = ((type: T) => ComponentDef.define(type, ...defs)) as ComponentDecorator<T>;
  const def = decorator as ComponentDef.Factory<InstanceType<T>>;

  def[ComponentDef__symbol] = () => ComponentDef.all(...defs);

  return decorator;
}
