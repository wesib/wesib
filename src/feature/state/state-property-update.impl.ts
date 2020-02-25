import { StatePath } from 'fun-events';
import { ComponentContext } from '../../component';
import { StatePropertyPath, statePropertyPathTo } from './state-property-path';
import { StatePropertyUpdateReceiver } from './state-property.decorator';

/**
 * @internal
 */
export type StatePropertyUpdateCallback<T extends object> = <K extends keyof T>(
    this: void,
    component: T,
    newValue: T[K],
    oldValue: T[K],
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

function updateStatePropertyState<T extends object, K extends keyof T>(
    component: T,
    path: StatePropertyPath<K>,
    newValue: T[K],
    oldValue: T[K],
): void {
  if (newValue !== oldValue) {
    ComponentContext.of(component).updateState(path, newValue, oldValue);
  }
}
