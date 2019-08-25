/**
 * @module @wesib/wesib
 */
import { TypedClassDecorator } from '../common';
import { ComponentClass } from './definition';
import { ComponentDef } from './component-def';

/**
 * Component class decorator.
 *
 * Decorate a class with this decorator to define a component like this:
 * ```TypeScript
 * @Component({ name: 'my-element' })
 * class MyComponent {
 *   // ...
 * }
 * ```
 *
 * Such component can be registered with [[BootstrapContext.define]] method, or used as a feature, e.g. passed to
 * [[bootstrapComponents]] function, or added to [[FeatureDef.needs]] property of another feature.
 *
 * This is an alternative to direct call to [[ComponentDef.define]] method.
 *
 * @category Core
 * @typeparam T  A type of decorated component class.
 * @param def  A component definition or just custom element name.
 *
 * @returns A component class decorator.
 */
export function Component<T extends ComponentClass = any>(
    def: ComponentDef<InstanceType<T>> | string,
): TypedClassDecorator<T> {
  return (type: T) => ComponentDef.define(type, typeof def === 'string' ? { name: def } : def);
}
