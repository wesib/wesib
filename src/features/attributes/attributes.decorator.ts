import { StateValueKey, TypedClassDecorator } from '../../common';
import { ComponentType } from '../../component';
import { attributeStateUpdate } from './attribute-state-update';
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
    E extends HTMLElement = HTMLElement>(opts: Attributes.Opts<T>): TypedClassDecorator<T> {

  const def: AttributesDef<T> = {};

  Object.keys(opts).forEach(name => {
    def[name] = attributeStateUpdate(name, opts[name]);
  });

  return (type: T) => AttributesDef.define(type, def);
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
