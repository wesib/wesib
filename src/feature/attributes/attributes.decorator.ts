/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { StatePath } from '@proc7ts/fun-events';
import { Class } from '../../common';
import { Component, ComponentDecorator } from '../../component';
import { ComponentClass } from '../../component/definition';
import { AttributeUpdateReceiver } from './attribute-def';
import { AttributeDescriptor } from './attribute-descriptor';
import { attributeStateUpdate } from './attribute-state-update.impl';
import { AttributesSupport } from './attributes-support.feature';
import { property2attributeName } from './property2attribute-name';

/**
 * Creates a component decorator declaring supported custom element's attributes.
 *
 * This decorator automatically enables [[AttributesSupport]] feature.
 *
 * @category Feature
 * @typeparam T  A type of decorated component class.
 * @param items  Attributes definition options.
 *
 * @return New component decorator.
 */
export function Attributes<T extends ComponentClass = Class>(
    ...items: readonly Attributes.Item<InstanceType<T>>[]
): ComponentDecorator<T> {
  return Component({
    feature: { needs: AttributesSupport },
    setup(setup) {
      for (const item of items) {
        if (typeof item === 'string') {

          const name = property2attributeName(item);

          setup.perDefinition({
            a: AttributeDescriptor,
            is: {
              name,
              change: attributeStateUpdate(name),
            },
          });
        } else {
          for (const [key, updateState] of Object.entries(item)) {

            const name = property2attributeName(key);

            setup.perDefinition({
              a: AttributeDescriptor,
              is: {
                name,
                change: attributeStateUpdate(name, updateState),
              },
            });
          }
        }
      }
    },
  });
}

export namespace Attributes {

  /**
   * Attribute definition item.
   *
   * This is either an attribute name (_camelCase_ or _dash-style_), or a per-attribute options map.
   *
   * @typeparam T  A type of component.
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
   * @typeparam T  A type of component.
   */
  export interface Map<T extends object> {
    readonly [name: string]: boolean | StatePath | AttributeUpdateReceiver<T>;
  }

}
