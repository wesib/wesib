/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { StatePath } from '@proc7ts/fun-events';
import { Class } from '@proc7ts/primitives';
import { ComponentProperty, ComponentPropertyDecorator } from '../../component';
import { ComponentClass } from '../../component/definition';
import { StatePropertyPath } from './state-property-path';
import { statePropertyUpdate } from './state-property-update.impl';

/**
 * Creates a decorator of component property containing part of component state.
 *
 * Once such property updated, the component state is {@link ComponentContext.updateState also updated}.
 *
 * @category Feature
 * @typeParam T - A type of decorated component class.
 * @param def - Custom element property definition.
 *
 * @returns Component property decorator.
 */
export function StateProperty<V = any, T extends ComponentClass = Class>(
    { updateState }: StatePropertyDef = {},
): ComponentPropertyDecorator<V, T> {
  return ComponentProperty(({ get, set, key }) => {
    if (updateState !== false) {

      const setValue = set;
      const update = statePropertyUpdate<InstanceType<T>>(key, updateState);

      set = (component, newValue) => {

        const oldValue = get(component);

        setValue(component, newValue);
        update(component, newValue, oldValue);
      };
    }

    return {
      get,
      set,
    };
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
  readonly updateState?: boolean | StatePath | StatePropertyUpdateReceiver<T>;

}

/**
 * Component state property updates receiver invoked when its value changed.
 *
 * @category Feature
 * @typeParam T - A type of component.
 */
export type StatePropertyUpdateReceiver<T extends object> =
/**
 * @typeParam K - A type of component property keys.
 * @param component - Component instance.
 * @param path - The changed property state path in the form of `[StatePropertyPath__root, propertyKey]`.
 * @param newValue - New property value.
 * @param oldValue - Previous property value.
 */
    <K extends keyof T>(
        this: void,
        component: T,
        path: StatePropertyPath<K>,
        newValue: T[K],
        oldValue: T[K],
    ) => void;
