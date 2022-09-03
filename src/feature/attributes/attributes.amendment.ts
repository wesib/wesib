import { hyphenateDecapName } from '@frontmeans/httongue';
import { StatePath } from '@proc7ts/fun-events';
import { Class } from '@proc7ts/primitives';
import { AeComponent, Component, ComponentAmendment } from '../../component';
import { ComponentClass } from '../../component/definition';
import { AttributeUpdateReceiver } from './attribute-def';
import { AttributeRegistry } from './attribute-registry';
import { attributeStateUpdate } from './attribute-state-update.impl';

/**
 * Creates a component amendment (and decorator) that declares supported attributes of component's element.
 *
 * @category Feature
 * @typeParam TClass - Amended component class type.
 * @typeParam TAmended - Amended component entity type.
 * @param items - Attributes definition options.
 *
 * @returns New component amendment and decorator.
 */
export function Attributes<
  TClass extends ComponentClass = Class,
  TAmended extends AeComponent<TClass> = AeComponent<TClass>,
>(
  ...items: readonly Attributes.Item<InstanceType<TClass>>[]
): ComponentAmendment<TClass, TAmended> {
  return Component({
    define(defContext) {
      const registry = defContext.get(AttributeRegistry);

      for (const item of items) {
        if (typeof item === 'string') {
          const name = hyphenateDecapName(item);

          registry.declareAttribute({
            name,
            change: attributeStateUpdate(name),
          });
        } else {
          for (const [key, updateState] of Object.entries(item)) {
            const name = hyphenateDecapName(key);

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
