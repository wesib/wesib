import { noop, StateValueKey } from '../../common';
import { ComponentContext, ComponentType } from '../../component';
import { ComponentDecorator } from '../../decorators';
import { AttributesDef, AttributeUpdateConsumer } from './attributes-def';
import './attributes-def.ns';

/**
 * Creates a web component decorator declaring supported custom HTML element attributes.
 *
 * This decorator automatically enables `AttributesSupport` feature.
 *
 * @param opts Attributes definition options.
 *
 * @return Web component decorator.
 */
export function Attributes<
    T extends ComponentType = any,
    E extends HTMLElement = HTMLElement>(opts: Attributes.Opts<T>): ComponentDecorator<T> {

  const def: AttributesDef<T> = {};

  Object.keys(opts).forEach(name => {

    const attr = opts[name];

    if (attr === false) {
      def[name] = noop;
      return;
    }
    if (attr === true || typeof attr === 'function') {

      const key = [StateValueKey.attribute, name];
      const updateState: AttributeUpdateConsumer<T> = attr === true ? defaultUpdateState : attr;

      def[name] = function (this: T, newValue, oldValue) {
        updateState.call(this, key, newValue, oldValue);
      };
      return;
    }
    def[name] = function (this: T, newValue, oldValue) {
      ComponentContext.of(this).updateState(attr, newValue, oldValue);
    };
  });

  return (type: T) => AttributesDef.define(type, def);
}

function defaultUpdateState<T extends object>(
    this: T,
    key: [typeof StateValueKey.attribute, string],
    newValue: string,
    oldValue: string | null) {
  ComponentContext.of(this).updateState(key, newValue, oldValue);
}

export namespace Attributes {

  /**
   * Attributes definition options.
   *
   * This is a map with attribute names as keys and their state update instructions as values.
   *
   * The state update instruction can be one of:
   * - `false` to not update the component state,
   * - `true` to update the component state with changed attribute key,
   * - a state value key to update, or
   * - an attribute update consumer function with custom state update logic.
   */
  export interface Opts<T extends object> {
    [name: string]: boolean | StateValueKey | AttributeUpdateConsumer<T>;
  }

}
