/**
 * @module @wesib/wesib
 */
import { noop } from 'call-thru';
import { StatePath } from 'fun-events';
import { ComponentContext } from '../../component';
import { AttributeUpdateReceiver } from './attribute-def';
import { AttributePath, attributePathTo } from './attribute-path';
import { AttributeChangedCallback } from './attribute-registrar';

/**
 * @internal
 */
export function attributeStateUpdate<T extends object>(
    name: string,
    updateState: boolean | AttributeUpdateReceiver<T> | StatePath = true,
): AttributeChangedCallback<T> {
  if (updateState === false) {
    return noop;
  }
  if (updateState === true || typeof updateState === 'function') {

    const key = attributePathTo(name);
    const update: AttributeUpdateReceiver<T> = updateState === true ? defaultUpdateState : updateState;

    return function (this: T, newValue, oldValue) {
      update.call(this, key, newValue, oldValue);
    };
  }
  return function (this: T, newValue, oldValue) {
    ComponentContext.of(this).updateState(updateState, newValue, oldValue);
  };
}

function defaultUpdateState<T extends object>(
    this: T,
    path: AttributePath,
    newValue: string,
    oldValue: string | null,
): void {
  ComponentContext.of(this).updateState(path, newValue, oldValue);
}
