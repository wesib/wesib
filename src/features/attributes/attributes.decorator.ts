import { StateValueKey, TypedClassDecorator } from '../../common';
import { ComponentClass, ComponentDef } from '../../component';
import { FeatureDef } from '../../feature';
import { AttributeRegistry, AttributeUpdateConsumer } from './attribute-registry';
import { attributeStateUpdate } from './attribute-state-update';
import { AttributesSupport } from './attributes-support.feature';

/**
 * Creates a component class decorator declaring supported custom element's attributes.
 *
 * This decorator automatically enables `AttributesSupport` feature.
 *
 * @param opts Attributes definition options.
 *
 * @return New component class decorator.
 */
export function Attributes<
    T extends ComponentClass = any,
    E extends HTMLElement = HTMLElement>(opts: Attributes.Opts<T>): TypedClassDecorator<T> {
  return componentType => {
    FeatureDef.define(componentType, { require: AttributesSupport });
    ComponentDef.define(
        componentType,
        {
          define(defContext) {

            const registry = defContext.get(AttributeRegistry.key);

            Object.keys(opts).forEach(name => {
              registry.onAttributeChange(name, attributeStateUpdate(name, opts[name]));
            });
          },
        });
  };
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
