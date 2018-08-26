import { ComponentPropertyDecorator } from '../../decorators';
import { FeatureType } from '../../feature';
import { Class } from '../../types';
import { AttributesDef, ComponentWithAttributesType } from './attributes-def';
import { AttributesSupportFeature } from './attributes-support.feature';

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
 * This decorator automatically enables `AttributesSupportFeature`.
 *
 * @param name Attribute name. This is required if annotated method's key is not a string (i.e. a symbol). Otherwise,
 * the attribute name is equal to method name by default.
 *
 * @return Web component method decorator.
 */
export function AttributeChanged<T extends Class>(name?: string): ComponentPropertyDecorator<T> {
  return <V>(target: T['prototype'], propertyKey: string | symbol) => {
    if (!name) {
      if (typeof propertyKey !== 'string') {
        throw new TypeError(
            'Attribute name is required, as property key is not a string: ' +
            `${target.constructor.name}.${propertyKey.toString()}`);
      }
      name = propertyKey;
    }

    const componentType = target.constructor as ComponentWithAttributesType<InstanceType<T>>;

    FeatureType.define(componentType, { requires: [AttributesSupportFeature] });

    componentType[AttributesDef.symbol] = AttributesDef.merge(
        AttributesDef.of(componentType),
        {
          [name]: function (this: InstanceType<T>, oldValue: string | null, newValue: string) {
            (this as any)[propertyKey](oldValue, newValue);
          }
        });

  };
}
