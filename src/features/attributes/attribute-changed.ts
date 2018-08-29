import { ComponentType } from '../../component';
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
 * @param name Attribute name. This is required if annotated method's key is not a string (i.e. a symbol). Otherwise,
 * the attribute name is equal to the method name by default.
 *
 * @return Web component method decorator.
 */
export function AttributeChanged<T extends ComponentType>(name?: string): ComponentPropertyDecorator<T> {
  return <V>(target: T['prototype'], propertyKey: string | symbol) => {
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
          [name]: function (this: InstanceType<T>, oldValue: string | null, newValue: string) {
            (this as any)[propertyKey](oldValue, newValue);
          }
        });

  };
}