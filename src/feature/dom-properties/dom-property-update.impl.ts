import { StatePath } from 'fun-events';
import { ComponentContext } from '../../component';
import { DomPropertyUpdateReceiver } from './dom-property-def';
import { DomPropertyPath, domPropertyPathTo } from './dom-property-path';

/**
 * @internal
 */
export type DomPropertyUpdateCallback<T extends object> = <K extends keyof T>(
    this: void,
    component: T,
    newValue: T[K],
    oldValue: T[K],
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
  return (component, newValue, oldValue) => ComponentContext.of(component).updateState(updateState, newValue, oldValue);
}

function updateDomPropertyState<T extends object, K extends keyof T>(
    component: T,
    path: DomPropertyPath<K>,
    newValue: T[K],
    oldValue: T[K],
): void {
  ComponentContext.of(component).updateState(path, newValue, oldValue);
}
