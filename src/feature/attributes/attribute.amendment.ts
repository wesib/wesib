import {
  AeComponentMember,
  AeComponentMemberTarget,
  ComponentContext,
  ComponentMember,
  ComponentMemberAmendment,
} from '../../component';
import { ComponentClass } from '../../component/definition';
import { AttributeDef } from './attribute-def';
import { parseAttributeDescriptor } from './attribute-descriptor.impl';
import { AttributeRegistry } from './attribute-registry';

/**
 * Creates an amendment (and decorator) of component property that accesses custom element's attribute.
 *
 * The amended property accesses corresponding attribute on read, and updates it on setting. `null` value corresponds
 * to absent attribute. Setting to `null` or `undefined` removes corresponding attribute.
 *
 * @category Feature
 * @typeParam TClass - Amended component class type.
 * @typeParam TAmended - Amended component member entity type.
 * @param def - Attribute definition or just an attribute name (either _camelCase_ or _dash-style_).
 *
 * @return New component property amendment.
 */
export function Attribute<
    TClass extends ComponentClass,
    TAmended extends AeComponentMember<string | null | undefined, TClass> =
        AeComponentMember<string | null | undefined, TClass>>(
    def?: AttributeDef<InstanceType<TClass>> | string,
): ComponentMemberAmendment<string | null | undefined, TClass, string | null | undefined, TAmended> {
  return ComponentMember<
      string | null | undefined,
      TClass,
      string | null | undefined,
      TAmended>((
      {
        amendedClass,
        key,
        set: setValue,
        amend,
      }: AeComponentMemberTarget<string | null | undefined, TClass>,
  ) => {

    const { name, change } = parseAttributeDescriptor(amendedClass.prototype, key, def);

    amend({
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
    });
  });
}
