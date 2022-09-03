import { StatePath } from '@proc7ts/fun-events';
import { ComponentContext } from '../../component';
import { StatePropertyPath, statePropertyPathTo } from './state-property-path';
import { StatePropertyUpdateReceiver } from './state-property.amendment';

/**
 * @internal
 */
export type StatePropertyUpdateCallback<T extends object> = <TKey extends keyof T>(
  this: void,
  component: T,
  newValue: T[TKey],
  oldValue: T[TKey],
) => void;

/**
 * @internal
 */
export function statePropertyUpdate<T extends object>(
  propertyKey: PropertyKey,
  updateState: true | StatePropertyUpdateReceiver<T> | StatePath = true,
): StatePropertyUpdateCallback<T> {
  if (updateState === true || typeof updateState === 'function') {
    const path = statePropertyPathTo(propertyKey as keyof T);
    const update = updateState === true ? updateStatePropertyState : updateState;

    return (component, newValue, oldValue) => update(component, path, newValue, oldValue);
  }

  return (component, newValue, oldValue) => {
    if (newValue !== oldValue) {
      ComponentContext.of(component).updateState(updateState, newValue, oldValue);
    }
  };
}

function updateStatePropertyState<T extends object, TKey extends keyof T>(
  component: T,
  path: StatePropertyPath<TKey>,
  newValue: T[TKey],
  oldValue: T[TKey],
): void {
  if (newValue !== oldValue) {
    ComponentContext.of(component).updateState(path, newValue, oldValue);
  }
}
