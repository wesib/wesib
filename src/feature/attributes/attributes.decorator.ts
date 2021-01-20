/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { StatePath } from '@proc7ts/fun-events';
import { Class } from '@proc7ts/primitives';
import { Component, ComponentDecorator } from '../../component';
import { ComponentClass } from '../../component/definition';
import { AttributeUpdateReceiver } from './attribute-def';
import { AttributeRegistry } from './attribute-registry';
import { attributeStateUpdate } from './attribute-state-update.impl';
import { property2attributeName } from './property2attribute-name';

/**
 * Creates a component decorator declaring supported custom element's attributes.
 *
 * @category Feature
 * @typeParam TClass - A type of decorated component class.
 * @param items - Attributes definition options.
 *
 * @return New component decorator.
 */
export function Attributes<TClass extends ComponentClass = Class>(
    ...items: readonly Attributes.Item<InstanceType<TClass>>[]
): ComponentDecorator<TClass> {
  return Component({
    define(defContext) {

      const registry = defContext.get(AttributeRegistry);

      for (const item of items) {
        if (typeof item === 'string') {

          const name = property2attributeName(item);

          registry.declareAttribute({
            name,
            change: attributeStateUpdate(name),
          });
        } else {
          for (const [key, updateState] of Object.entries(item)) {

            const name = property2attributeName(key);

            registry.declareAttribute({
              name,
              change: attributeStateUpdate(name, updateState),
            });
          }
        }
      }
    },
  });
}

/**
 * @category Feature
 */
export namespace Attributes {

  /**
   * Attribute definition item.
   *
   * This is either an attribute name (_camelCase_ or _dash-style_), or a per-attribute options map.
   *
   * @typeParam T - A type of component.
   */
  export type Item<T extends object> = Map<T> | string;

  /**
   * Per-attribute definition options.
   *
   * This is a map with attribute names as keys (either _camelCase_ or _dash-style_), and their state update
   * instructions as values.
   *
   * The state update instruction can be one of:
   * - `false` to not update the component state,
   * - `true` to update the component state with changed attribute key,
   * - a state value key to update, or
   * - an attribute update receiver function with custom state update logic.
   *
   * @typeParam T - A type of component.
   */
  export interface Map<T extends object> {
    readonly [name: string]: boolean | StatePath | AttributeUpdateReceiver<T>;
  }

}
