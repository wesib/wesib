import { noop } from 'call-thru';
import { StatePath } from 'fun-events';
import { ComponentContext } from '../../component';
import { attributePath, attributePathRoot } from './attribute-path';
import { AttributeChangedCallback, AttributeUpdateConsumer } from './attribute-registrar';

/**
 * @internal
 */
export function attributeStateUpdate<T extends object>(
    name: string,
    updateState: boolean | AttributeUpdateConsumer<T> | StatePath = true): AttributeChangedCallback<T> {
  if (updateState === false) {
    return noop;
  }
  if (updateState === true || typeof updateState === 'function') {

    const key = attributePath(name);
    const update: AttributeUpdateConsumer<T> = updateState === true ? defaultUpdateState : updateState;

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
    key: [typeof attributePathRoot, string],
    newValue: string,
    oldValue: string | null) {
  ComponentContext.of(this).updateState(key, newValue, oldValue);
}
