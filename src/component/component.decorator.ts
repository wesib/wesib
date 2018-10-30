import { TypedClassDecorator } from '../common';
import { ComponentClass } from './component-class';
import { ComponentContext } from './component-context';
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
 * Such component can be registered with `BootstrapContext.define()` method, or used as a feature, e.g. passed to
 * `bootstrapComponents()` method, or added to `FeatureDef.require` property of another feature.
 *
 * This is an alternative to direct call to `ComponentDef.define()` method.
 *
 * @param <T> A type of component.
 * @param <E> A type of custom element this component extends.
 * @param def A component definition or just custom element name.
 *
 * @returns A component class decorator.
 */
export function Component<T extends ComponentClass = any>(
    def: ComponentDef<InstanceType<T>> | string):
    TypedClassDecorator<T> {
  return (type: T) => ComponentDef.define(type, typeof def === 'string' ? { name: def } : def);
}


