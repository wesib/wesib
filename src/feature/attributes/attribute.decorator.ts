import { ComponentContext, ComponentProperty, ComponentPropertyDecorator } from '../../component';
import { ComponentClass } from '../../component/definition';
import { AttributeDef } from './attribute-def';
import { parseAttributeDescriptor } from './attribute-descriptor.impl';
import { AttributeRegistry } from './attribute-registry';

/**
 * Creates a decorator for component's property that accesses custom element's attribute.
 *
 * The decorated property accesses corresponding attribute on read, and updates it on setting. `null` value corresponds
 * to absent attribute. Setting to `null` or `undefined` removes corresponding attribute.
 *
 * @category Feature
 * @typeParam TClass - A type of decorated component class.
 * @param def - Attribute definition or just an attribute name (either _camelCase_ or _dash-style_).
 *
 * @return Component property decorator.
 */
export function Attribute<TClass extends ComponentClass>(
    def?: AttributeDef<InstanceType<TClass>> | string,
): ComponentPropertyDecorator<string | null | undefined, TClass> {
  return ComponentProperty(({ type, key, set: setValue }) => {

    const { name, change } = parseAttributeDescriptor(type.prototype, key, def);

    return {
      componentDef: {
        define(defContext) {
          defContext.get(AttributeRegistry).declareAttribute({
            name,
            change(component, newValue, oldValue) {
              setValue(component, newValue);
              change(component, newValue, oldValue);
            },
          });
        },
      },
      get(component: InstanceType<TClass>): string | null {
        return (ComponentContext.of(component).element as Element).getAttribute(name);
      },
      set(component: InstanceType<TClass>, newValue: string | null) {

        const { element } = ComponentContext.of(component) as { element: Element };

        if (newValue != null) {
          element.setAttribute(name, newValue);
        } else {
          element.removeAttribute(name);
        }

        setValue(component, newValue);
      },
    };
  });
}
