import { Class } from '@proc7ts/primitives';
import { AeComponentMember, AeComponentMemberTarget, ComponentMember, ComponentMemberAmendment } from '../../component';
import { ComponentClass } from '../../component/definition';
import { DomPropertyDef } from './dom-property-def';
import { domPropertyDescriptor } from './dom-property-descriptor.impl';
import { DomPropertyRegistry } from './dom-property-registry';
import { domPropertyUpdate } from './dom-property-update.impl';

/**
 * Creates component member amendment (and decorator) that declares a property to add to component's element.
 *
 * The value of declared element's property will be read from and written to decorated member.
 *
 * By default does not update component state if property value didn't change.
 *
 * @category Feature
 * @typeParam TValue - Amended member value type
 * @typeParam TClass - Amended component class type.
 * @typeParam TUpdate - Amended member update type accepted by its setter.
 * @typeParam TAmended - Amended component member entity type.
 * @param def - Custom element property definition.
 *
 * @returns New component member decorator.
 */
export function DomProperty<
    TValue extends TUpdate,
    TClass extends ComponentClass = Class,
    TUpdate = TValue,
    TAmended extends AeComponentMember<TValue, TClass, TUpdate> = AeComponentMember<TValue, TClass, TUpdate>>(
    def: DomPropertyDef<InstanceType<TClass>> = {},
): ComponentMemberAmendment<TValue, TClass, TUpdate, TAmended> {
  return ComponentMember<TValue, TClass, TUpdate, TAmended>((
      target: AeComponentMemberTarget<TValue, TClass, TUpdate>,
  ) => {

    const { key, get, amend } = target;
    let { set } = target;
    const domDescriptor = domPropertyDescriptor(target, def);

    if (def.updateState !== false) {

      const updateState = domPropertyUpdate<InstanceType<TClass>>(key, def.updateState);
      const setValue = set;

      set = (component, newValue) => {

        const oldValue = get(component);

        setValue(component, newValue);
        updateState(component, newValue, oldValue);
      };
    }

    amend({
      componentDef: {
        define(defContext) {
          defContext.get(DomPropertyRegistry).declareDomProperty(domDescriptor);
        },
      },
      get,
      set,
    });
  });
}

/**
 * Component method amendment (and decorator) that declares a method to add to component's element.
 *
 * This is just an alias of {@link DomProperty @DomProperty}.
 *
 * @category Feature
 */
export { DomProperty as DomMethod };
