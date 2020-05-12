/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { ComponentContext, ComponentProperty, ComponentPropertyDecorator } from '../../component';
import { ComponentClass } from '../../component/definition';
import { AttributeDef } from './attribute-def';
import { parseAttributeDescriptor } from './attribute-descriptor.impl';
import { AttributeRegistry } from './attribute-registry';

/**
 * Creates a decorator for component's property that accesses custom element's attribute.
 *
 * The decorated property accesses corresponding attribute on read, and updates it on setting. `null` value corresponds
 * to absent attribute. Setting to `null` removes corresponding attribute.
 *
 * @category Feature
 * @typeparam T  A type of decorated component class.
 * @param def  Attribute definition or just an attribute name (either _camelCase_ or _dash-style_).
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
        define(defContext) {
          defContext.get(AttributeRegistry).declareAttribute(descriptor);
        },
      },
      get(component: InstanceType<T>): string | null {
        return ComponentContext.of(component).element.getAttribute(name);
      },
      set(component: InstanceType<T>, newValue: string | null) {

        const { element }: { element: Element } = ComponentContext.of(component);

        if (newValue != null) {
          element.setAttribute(name, newValue);
        } else {
          element.removeAttribute(name);
        }
      },
    };
  });
}
