import { StatePath } from 'fun-events';
import { ComponentContext } from '../../component';
import { DomPropertyUpdateReceiver } from './dom-property-def';
import { DomPropertyPath, domPropertyPathTo } from './dom-property-path';

/**
 * @internal
 */
export type DomPropertyUpdateCallback<T extends object> = <K extends keyof T>(
    this: T,
    newValue: T[K],
    oldValue: T[K],
) => void;

/**
 * @internal
 */
export function propertyStateUpdate<T extends object>(
    propertyKey: PropertyKey,
    updateState: true | DomPropertyUpdateReceiver<T> | StatePath = true,
): DomPropertyUpdateCallback<T> {
  if (updateState === true || typeof updateState === 'function') {

    const path = domPropertyPathTo(propertyKey);
    const update: any = updateState === true ? defaultUpdateState : updateState;

    return function (this: T, newValue, oldValue) {
      update.call(this, path, newValue, oldValue);
    };
  }
  return function (this: T, newValue, oldValue) {
    ComponentContext.of(this).updateState(updateState, newValue, oldValue);
  };
}

function defaultUpdateState<T extends object, K extends keyof T>(
    this: T,
    path: DomPropertyPath<K>,
    newValue: T[K],
    oldValue: T[K],
) {
  ComponentContext.of(this).updateState(path, newValue, oldValue);
}
