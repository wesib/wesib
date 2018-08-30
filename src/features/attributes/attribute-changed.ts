import { ComponentContext, ComponentType, ComponentValueKey } from '../../component';
import { ComponentPropertyDecorator } from '../../decorators';
import { AttributesDef } from './attributes-def';
import './attributes-def.ns';

/**
 * Creates a web component decorator for custom HTML element attribute change callback.
 *
 * The decorated method should have up to two parameters:
 *
 * - the first one accepting old attribute value (or `null`),
 * - the second one accepting new attribute value.
 *
 * Example:
 * ```TypeScript
 * @WebComponent({ name: 'my-component' })
 * class MyComponent {
 *
 *   @AttributeChanged('my-attribute')
 *   void myAttributeChanged(oldValue: string | null, newValue: string) {
 *     console.log(`my-attribute value changed from ${oldValue} to ${newValue}`);
 *   }
 *
 * }
 * ```
 *
 * This decorator automatically enables `AttributesSupport` feature.
 *
 * @param opts Attribute changes tracking options, or just attribute name
 *
 * @return Web component method decorator.
 */
export function AttributeChanged<T extends ComponentType>(opts?: AttributeChanged.Opts<T> | string):
    ComponentPropertyDecorator<T> {
  return <V>(target: T['prototype'], propertyKey: string | symbol) => {

    let name: string | undefined;
    let refreshState = true;

    if (typeof opts === 'string') {
      name = opts;
    } else if (opts != null) {
      name = opts.name;
      if (opts.refreshState === false) {
        refreshState = false;
      }
    }
    if (!name) {
      if (typeof propertyKey !== 'string') {
        throw new TypeError(
            'Attribute name is required, as property key is not a string: ' +
            `${target.constructor.name}.${propertyKey.toString()}`);
      }
      name = propertyKey;
    }

    const componentType = target.constructor as T;

    AttributesDef.define(
        componentType,
        {
          [name]: function (
              this: InstanceType<T>,
              oldValue: string | null,
              newValue: string,
              context: ComponentContext<T>) {
            (this as any)[propertyKey](oldValue, newValue, context);
            if (refreshState) {
              context.get(ComponentValueKey.stateRefresh)();
            }
          }
        });

  };
}

export namespace AttributeChanged {

  /**
   * Attribute changes tracking options.
   *
   * This is passed to `@AttributeChanged` decorator.
   */
  export interface Opts<T extends object> {

    /**
     * Attribute name.
     *
     * This is required if annotated method's key is not a string (i.e. a symbol). Otherwise,
     * the attribute name is equal to the method name by default.
     */
    name?: string;

    /**
     * Whether to refresh the component state after callback.
     *
     * When not `false` the component state will be refreshed.
     *
     * `true` by default.
     */
    refreshState?: boolean;

  }

}
