/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { ComponentContext, ComponentProperty, ComponentPropertyDecorator } from '../../component';
import { ComponentClass } from '../../component/definition';
import { AttributeDef } from './attribute-def';
import { AttributeDescriptor } from './attribute-descriptor';
import { parseAttributeDescriptor } from './attribute-descriptor.impl';
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

    const descriptor = parseAttributeDescriptor(type.prototype, key, def);
    const { name } = descriptor;

    return {
      componentDef: {
        feature: {
          needs: AttributesSupport,
        },
        setup(setup) {
          setup.perDefinition({ a: AttributeDescriptor, is: descriptor });
        },
      },
      get(component: InstanceType<T>): string | null {
        return ComponentContext.of(component).element.getAttribute(name);
      },
      set(component: InstanceType<T>, newValue: string | null) {
        ComponentContext.of(component).element.setAttribute(name, newValue);
      },
    };
  });
}
