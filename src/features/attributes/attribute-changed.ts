import { noop } from '../../common';
import { ComponentContext, ComponentType } from '../../component';
import { ComponentPropertyDecorator } from '../../decorators';
import { AttributeChangedCallback, AttributesDef } from './attributes-def';
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
  return <V>(target: InstanceType<T>, propertyKey: string | symbol) => {

    let name: string | undefined;
    let refreshState: AttributeChangedCallback<InstanceType<T>> = defaultRefresh;

    if (typeof opts === 'string') {
      name = opts;
    } else if (opts != null) {
      name = opts.name;
      if (opts.refreshState === false) {
        refreshState = noop;
      } else if (typeof opts.refreshState === 'function') {
        refreshState = opts.refreshState;
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
              newValue: string,
              oldValue: string | null) {

            const callback: AttributeChangedCallback<InstanceType<T>> = (this as any)[propertyKey];

            callback.call(this, newValue, oldValue);
            refreshState.call(this, newValue, oldValue);
          }
        });

  };
}

function defaultRefresh<T extends object>(this: T, newValue: string, oldValue: string | null) {
  ComponentContext.of(this).refreshState();
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
     * Either a callback to call, or boolean value:
     * - when `false` the component state will be refreshed.
     * - when `true` (the default value), then the component state will be refreshed with `attr:<ATTRIBUTE NAME>`
     * as changed value key.
     */
    refreshState?: boolean | AttributeChangedCallback<T>;

  }

}
