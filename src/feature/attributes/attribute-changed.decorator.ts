/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { ComponentProperty, ComponentPropertyDecorator } from '../../component';
import { ComponentClass } from '../../component/definition';
import { AttributeDef } from './attribute-def';
import { AttributeChangedCallback, AttributeDescriptor } from './attribute-descriptor';
import { parseAttributeDescriptor } from './attribute-descriptor.impl';
import { AttributesSupport } from './attributes-support.feature';

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
 * @Component('my-component')
 * class MyComponent {
 *
 *   @AttributeChanged('my-attribute')
 *   myAttributeChanged(newValue: string, oldValue: string | null) {
 *     console.log(`my-attribute value changed from ${oldValue} to ${newValue}`);
 *   }
 *
 * }
 * ```
 *
 * This decorator automatically enables [[AttributesSupport]] feature.
 *
 * @category Feature
 * @typeparam T  A type of decorated component class.
 * @param def  Attribute definition or just an attribute name.
 *
 * @return Component method decorator.
 */
export function AttributeChanged<T extends ComponentClass>(
    def?: AttributeDef<InstanceType<T>> | string,
): ComponentPropertyDecorator<(newValue: string, oldValue: string | null) => void, T> {
  return ComponentProperty(({ type, key }) => {

    const { name, change } = parseAttributeDescriptor(type.prototype, key, def);

    return {
      componentDef: {
        feature: {
          needs: AttributesSupport,
        },
        setup(setup) {
          setup.perDefinition({
            a: AttributeDescriptor,
            is: {
              name,
              change(
                  this: InstanceType<T>,
                  newValue: string,
                  oldValue: string | null,
              ) {

                const callback: AttributeChangedCallback<InstanceType<T>> = (this as any)[key];

                callback.call(this, newValue, oldValue);
                change.call(this, newValue, oldValue);
              },
            },
          });
        },
      },
    };
  });
}
