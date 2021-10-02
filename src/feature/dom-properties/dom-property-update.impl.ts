import { StatePath } from '@proc7ts/fun-events';
import { ComponentContext } from '../../component';
import { DomPropertyUpdateReceiver } from './dom-property-def';
import { DomPropertyPath, domPropertyPathTo } from './dom-property-path';

/**
 * @internal
 */
export type DomPropertyUpdateCallback<T extends object> = <TKey extends keyof T>(
    this: void,
    component: T,
    newValue: T[TKey],
    oldValue: T[TKey],
) => void;

/**
 * @internal
 */
export function domPropertyUpdate<T extends object>(
    propertyKey: PropertyKey,
    updateState: true | DomPropertyUpdateReceiver<T> | StatePath = true,
): DomPropertyUpdateCallback<T> {
  if (updateState === true || typeof updateState === 'function') {

    const path = domPropertyPathTo(propertyKey as keyof T);
    const update = updateState === true ? updateDomPropertyState : updateState;

    return (component, newValue, oldValue) => update(component, path, newValue, oldValue);
  }

  return (component, newValue, oldValue) => {
    if (newValue !== oldValue) {
      ComponentContext.of(component).updateState(updateState, newValue, oldValue);
    }
  };
}

function updateDomPropertyState<T extends object, TKey extends keyof T>(
    component: T,
    path: DomPropertyPath<TKey>,
    newValue: T[TKey],
    oldValue: T[TKey],
): void {
  if (newValue !== oldValue) {
    ComponentContext.of(component).updateState(path, newValue, oldValue);
  }
}
