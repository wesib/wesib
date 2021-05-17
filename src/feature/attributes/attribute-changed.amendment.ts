import { AmendTarget } from '@proc7ts/amend';
import { AeComponentMember, ComponentMember, ComponentMemberAmendment } from '../../component';
import { ComponentClass } from '../../component/definition';
import { AttributeDef } from './attribute-def';
import { parseAttributeDescriptor } from './attribute-descriptor.impl';
import { AttributeRegistry } from './attribute-registry';

/**
 * Creates a component method amendment (and decorator) for custom element attribute {@link AttributeDef.ChangeMethod
 * change callback}.
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
 * @typeParam TClass - Amended component class type.
 * @typeParam TAmended - Amended component member entity type.
 * @param def - Attribute definition or just an attribute name.
 *
 * @return New component method amendment.
 */
export function AttributeChanged<
    TClass extends ComponentClass,
    TAmended extends AeComponentMember<AttributeDef.ChangeMethod, TClass>>(
    def?: AttributeDef<InstanceType<TClass>> | string,
): ComponentMemberAmendment<AttributeDef.ChangeMethod, TClass, AttributeDef.ChangeMethod, TAmended> {
  return ComponentMember<AttributeDef.ChangeMethod, TClass, AttributeDef.ChangeMethod, TAmended>((
      { amendedClass, get, key, amend }: AmendTarget<AeComponentMember<AttributeDef.ChangeMethod, TClass>>,
  ) => {

    const { name, change } = parseAttributeDescriptor(amendedClass.prototype, key, def);

    amend({
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
    });
  });
}
