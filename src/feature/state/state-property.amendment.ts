import { StatePath } from '@proc7ts/fun-events';
import { Class } from '@proc7ts/primitives';
import { AeComponentMember, AeComponentMemberTarget, ComponentMember, ComponentMemberAmendment } from '../../component';
import { ComponentClass } from '../../component/definition';
import { StatePropertyPath } from './state-property-path';
import { statePropertyUpdate } from './state-property-update.impl';

/**
 * Creates an amendment (and decorator) of component member representing a property of component state.
 *
 * Once such property updated, the component state is {@link ComponentContext.updateState also updated}.
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
export function StateProperty<
    TValue extends TUpdate,
    TClass extends ComponentClass = Class,
    TUpdate = TValue,
    TAmended extends AeComponentMember<TValue, TClass, TUpdate> = AeComponentMember<TValue, TClass, TUpdate>>(
    { updateState }: StatePropertyDef<InstanceType<TClass>> = {},
): ComponentMemberAmendment<TValue, TClass, TUpdate, TAmended> {
  return ComponentMember<TValue, TClass, TUpdate, TAmended>((
      { key, get, set, amend }: AeComponentMemberTarget<TValue, TClass, TUpdate>,
  ) => {
    if (updateState !== false) {

      const update = statePropertyUpdate(key, updateState);

      amend({
        get,
        set(component, newValue) {

          const oldValue = get(component);

          set(component, newValue);
          update(component, newValue, oldValue);
        },
      });
    }
  });
}

/**
 * Component state property definition.
 *
 * This is a parameter to {@link StateProperty @StateProperty} decorator applied to component property.
 *
 * @category Feature
 */
export interface StatePropertyDef<T extends object = any> {

  /**
   * Whether to update the component state after this property changed.
   *
   * Can be one of:
   * - `false` to not update the component state,
   * - `true` (the default value) to update the component state with changed property key,
   * - a state value key to update, or
   * - an state property update receiver function with custom state update logic.
   *
   * By default does not update component state if property value didn't change.
   */
  readonly updateState?: boolean | StatePath | StatePropertyUpdateReceiver<T> | undefined;

}

/**
 * Component state property updates receiver invoked when its value changed.
 *
 * @category Feature
 * @typeParam T - A type of component.
 */
export type StatePropertyUpdateReceiver<T extends object> =
/**
 * @typeParam TKey - A type of component property keys.
 * @param component - Component instance.
 * @param path - The changed property state path in the form of `[StatePropertyPath__root, propertyKey]`.
 * @param newValue - New property value.
 * @param oldValue - Previous property value.
 */
    <TKey extends keyof T>(
        this: void,
        component: T,
        path: StatePropertyPath<TKey>,
        newValue: T[TKey],
        oldValue: T[TKey],
    ) => void;
