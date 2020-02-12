/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { ComponentProperty, ComponentPropertyDecorator } from '../../component';
import { ComponentClass } from '../../component/definition';
import { AttributeDef } from './attribute-def';
import { parseAttributeDef } from './attribute-def.impl';
import { AttributeRegistrar } from './attribute-registrar';
import { AttributesSupport } from './attributes-support.feature';

/**
 * Creates a decorator for component's property that accesses custom element's attribute.
 *
 * The decorated property accesses corresponding attribute on read, and updates it on setting.
 *
 * This decorator automatically enables [[AttributesSupport]] feature.
 *
 * @category Feature
 * @typeparam T  A type of decorated component class.
 * @param def  Attribute definition or just an attribute name.
 *
 * @return Component property decorator.
 */
export function Attribute<T extends ComponentClass>(
    def?: AttributeDef<InstanceType<T>> | string,
): ComponentPropertyDecorator<string | null, T> {
  return ComponentProperty(({ type, key }) => {

    const { name, updateState } = parseAttributeDef(type.prototype, key, def);

    return {
      componentDef: {
        feature: {
          needs: AttributesSupport,
        },
        define(definitionContext) {
          definitionContext.get(AttributeRegistrar)(name, updateState);
        },
      },
      access({ element }) {
        return {
          get(this: InstanceType<T>): string | null {
            return element.getAttribute(name);
          },
          set(this: InstanceType<T>, newValue: string | null) {
            element.setAttribute(name, newValue);
          },
        };
      },
    };
  });
}
