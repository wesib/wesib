/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { Class } from '@proc7ts/primitives';
import { ComponentDef, ComponentDef__symbol } from './component-def';
import { ComponentClass } from './definition';

/**
 * Component decorator interface.
 *
 * In addition to being a decorator for component class, it may also serve as {@link ComponentDef component definition}.
 * Thus it can be added as parameter to {@link Component @Component} decorator, or used as class decorator by itself.
 *
 * Constructed by {@link Component} function.
 *
 * @category Core
 * @typeParam TClass - A type of decorated component class.
 */
export interface ComponentDecorator<TClass extends ComponentClass = Class>
    extends ComponentDef.Factory<InstanceType<TClass>> {

  (this: void, type: TClass): TClass | void;

}

/**
 * Decorator of component class.
 *
 * Decorated class becomes component:
 * ```TypeScript
 * @Component({ name: 'my-element' })
 * class MyComponent {
 *   // ...
 * }
 * ```
 *
 * Such component can be registered with {@link FeatureContext.define} method or used as a feature, e.g. passed to
 * {@link bootstrapComponents} function, or added to {@link FeatureDef.Options.needs} property of another feature.
 *
 * This is an alternative to direct call to {@link ComponentDef.Options.define} method.
 *
 * @category Core
 * @typeParam TClass - A type of decorated component class.
 * @param defs - Component definitions.
 *
 * @returns A component class decorator.
 */
export function Component<TClass extends ComponentClass = Class>(
    ...defs: ComponentDef<InstanceType<TClass>>[]
): ComponentDecorator<TClass> {

  const decorator = ((type: TClass) => ComponentDef.define(type, ...defs)) as ComponentDecorator<TClass>;
  const def = decorator as ComponentDef.Factory<InstanceType<TClass>>;

  def[ComponentDef__symbol] = () => ComponentDef.all(...defs);

  return decorator;
}
