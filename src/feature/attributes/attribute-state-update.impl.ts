/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { noop } from 'call-thru';
import { StatePath } from 'fun-events';
import { ComponentContext } from '../../component';
import { AttributeUpdateReceiver } from './attribute-def';
import { AttributeChangedCallback } from './attribute-descriptor';
import { attributePathTo } from './attribute-path';

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

    const path = attributePathTo(name);
    const update: AttributeUpdateReceiver<T> = updateState === true ? updateAttributeState : updateState;

    return (component: T, newValue, oldValue) => update(component, path, newValue, oldValue);
  }

  return (component: T, newValue, oldValue) => updateAttributeState(component, updateState, newValue, oldValue);
}

function updateAttributeState<T extends object>(
    component: T,
    path: StatePath,
    newValue: string,
    oldValue: string | null,
): void {
  ComponentContext.of(component).updateState(path, newValue, oldValue);
}
