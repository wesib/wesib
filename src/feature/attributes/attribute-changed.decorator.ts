/**
 * @module @wesib/wesib
 */
import { TypedPropertyDecorator } from '../../common';
import { ComponentClass, ComponentDef } from '../../component';
import { FeatureDef } from '../feature-def';
import { AttributeDef } from './attribute-def';
import { parseAttributeDef } from './attribute-def.impl';
import { AttributeChangedCallback, AttributeRegistrar } from './attribute-registrar';
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
 *   void myAttributeChanged(newValue: string, oldValue: string | null) {
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
): TypedPropertyDecorator<T> {
  return (target: InstanceType<T>, propertyKey: string | symbol) => {

    const { name, updateState } = parseAttributeDef(target, propertyKey, def);
    const componentType = target.constructor as T;

    FeatureDef.define(componentType, { needs: AttributesSupport });
    ComponentDef.define(
        componentType,
        {
          define(defContext) {
            defContext.get(AttributeRegistrar)(name, function (
                this: InstanceType<T>,
                newValue: string,
                oldValue: string | null) {

              const callback: AttributeChangedCallback<InstanceType<T>> = (this as any)[propertyKey];

              callback.call(this, newValue, oldValue);
              updateState.call(this, newValue, oldValue);
            });
          },
        });
  };
}
