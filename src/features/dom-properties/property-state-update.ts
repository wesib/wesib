import { StateValueKey } from '../../common';
import { ComponentContext } from '../../component';
import { DomPropertyUpdateConsumer } from './dom-property';

/**
 * @internal
 */
export type DomPropertyUpdateCallback<T extends object> = <K extends keyof T>(
    this: T,
    newValue: T[K],
    oldValue: T[K]) => void;

/**
 * @internal
 */
export function propertyStateUpdate<T extends object>(
    propertyKey: PropertyKey,
    updateState: true | DomPropertyUpdateConsumer<T> | StateValueKey = true): DomPropertyUpdateCallback<T> {
  if (updateState === true || typeof updateState === 'function') {

    const key = [StateValueKey.property, propertyKey];
    const update: DomPropertyUpdateConsumer<T> = updateState === true ? defaultUpdateState : updateState;

    return function (this: T, newValue, oldValue) {
      update.call(this, key, newValue, oldValue);
    };
  }
  return function (this: T, newValue, oldValue) {
    ComponentContext.of(this).updateState(updateState, newValue, oldValue);
  };
}

function defaultUpdateState<T extends object, K extends keyof T>(
    this: T,
    key: [typeof StateValueKey.property, K],
    newValue: T[K],
    oldValue: T[K]) {
  ComponentContext.of(this).updateState(key, newValue, oldValue);
}
