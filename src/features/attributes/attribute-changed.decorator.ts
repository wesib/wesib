import { TypedPropertyDecorator } from '../../common';
import { ComponentClass } from '../../component';
import { Attribute, parseAttributeOpts } from './attribute.decorator';
import { AttributeChangedCallback, AttributesDef } from './attributes-def';
import './attributes-def.ns';

/**
 * Creates a component method decorator for custom element attribute change callback.
 *
 * The decorated method should have up to two parameters:
 *
 * - the first one accepts new attribute value.
 * - the second one accepts old attribute value (or `null`),
 *
 * Example:
 * ```TypeScript
 * @WesComponent('my-component')
 * class MyComponent {
 *
 *   @AttributeChanged('my-attribute')
 *   void myAttributeChanged(newValue: string, oldValue: string | null) {
 *     console.log(`my-attribute value changed from ${oldValue} to ${newValue}`);
 *   }
 *
 * }
 * ```
 *
 * This decorator automatically enables `AttributesSupport` feature.
 *
 * @param opts Attribute definition options, or just an attribute name.
 *
 * @return Component method decorator.
 */
export function AttributeChanged<T extends ComponentClass>(opts?: Attribute.Opts<T> | string):
    TypedPropertyDecorator<T> {
  return <V>(target: InstanceType<T>, propertyKey: string | symbol) => {

    const { name, updateState } = parseAttributeOpts(target, propertyKey, opts);
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
            updateState.call(this, newValue, oldValue);
          }
        });
  };
}
