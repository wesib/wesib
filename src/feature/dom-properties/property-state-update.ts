import { StatePath } from 'fun-events';
import { ComponentContext } from '../../component';
import { domPropertyPath, domPropertyPath__root } from './dom-property-path';
import { DomPropertyUpdateConsumer } from './dom-property.decorator';

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
    updateState: true | DomPropertyUpdateConsumer<T> | StatePath = true): DomPropertyUpdateCallback<T> {
  if (updateState === true || typeof updateState === 'function') {

    const path = domPropertyPath(propertyKey);
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
    path: [typeof domPropertyPath__root, K],
    newValue: T[K],
    oldValue: T[K]) {
  ComponentContext.of(this).updateState(path, newValue, oldValue);
}
