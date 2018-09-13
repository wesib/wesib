import { noop, StateValueKey } from '../../common';
import { ComponentContext } from '../../component';
import { AttributeChangedCallback, AttributeUpdateConsumer } from './attribute-registry';

/**
 * @internal
 */
export function attributeStateUpdate<T extends object>(
    name: string,
    updateState: boolean | AttributeUpdateConsumer<T> | StateValueKey = true): AttributeChangedCallback<T> {
  if (updateState === false) {
    return noop;
  }
  if (updateState === true || typeof updateState === 'function') {

    const key = [StateValueKey.attribute, name];
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
    key: [typeof StateValueKey.attribute, string],
    newValue: string,
    oldValue: string | null) {
  ComponentContext.of(this).updateState(key, newValue, oldValue);
}
