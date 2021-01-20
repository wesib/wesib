/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { ComponentProperty, ComponentPropertyDecorator } from '../../component';
import { ComponentClass } from '../../component/definition';
import { AttributeDef } from './attribute-def';
import { parseAttributeDescriptor } from './attribute-descriptor.impl';
import { AttributeRegistry } from './attribute-registry';

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
 * @category Feature
 * @typeParam TClass - A type of decorated component class.
 * @param def - Attribute definition or just an attribute name.
 *
 * @return Component method decorator.
 */
export function AttributeChanged<TClass extends ComponentClass>(
    def?: AttributeDef<InstanceType<TClass>> | string,
): ComponentPropertyDecorator<(newValue: string | null, oldValue: string | null) => void, TClass> {
  return ComponentProperty(({ type, get, key }) => {

    const { name, change } = parseAttributeDescriptor(type.prototype, key, def);

    return {
      componentDef: {
        define(defContext) {
          defContext.get(AttributeRegistry).declareAttribute({
            name,
            change(
                component: InstanceType<TClass>,
                newValue: string | null,
                oldValue: string | null,
            ) {

              const callback = get(component);

              callback.call(component, newValue, oldValue);
              change(component, newValue, oldValue);
            },
          });
        },
      },
    };
  });
}
