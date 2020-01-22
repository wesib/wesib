/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { StatePath } from 'fun-events';
import { TypedClassDecorator } from '../../common';
import { isArray } from '../../common/types.impl';
import { ComponentDef } from '../../component';
import { ComponentClass } from '../../component/definition';
import { FeatureDef } from '../feature-def';
import { AttributeUpdateReceiver } from './attribute-def';
import { AttributeRegistrar } from './attribute-registrar';
import { attributeStateUpdate } from './attribute-state-update.impl';
import { AttributesSupport } from './attributes-support.feature';

/**
 * Creates a component class decorator declaring supported custom element's attributes.
 *
 * This decorator automatically enables [[AttributesSupport]] feature.
 *
 * @category Feature
 * @typeparam T  A type of decorated component class.
 * @param items  Attributes definition options. Either an attribute definition item, or an array of such items.
 *
 * @return New component class decorator.
 */
export function Attributes<T extends ComponentClass = any>(
    items: Attributes.Item<InstanceType<T>> | readonly Attributes.Item<InstanceType<T>>[],
): TypedClassDecorator<T> {
  return componentType => {
    FeatureDef.define(componentType, { needs: AttributesSupport });
    ComponentDef.define(
        componentType,
        {
          define(defContext) {

            const registrar = defContext.get(AttributeRegistrar);

            const defineByItem = (item: Attributes.Item<InstanceType<T>>): void => {
              if (typeof item === 'string') {
                registrar(item, attributeStateUpdate(item));
              } else {
                Object.keys(item).forEach(name => {
                  registrar(name, attributeStateUpdate(name, item[name]));
                });
              }
            };

            if (isArray<Attributes.Item<InstanceType<T>>>(items)) {
              items.forEach(defineByItem);
            } else {
              defineByItem(items);
            }
          },
        },
    );
  };
}

export namespace Attributes {

  /**
   * Attribute definition item.
   *
   * This is either an attribute name, or a per-attribute options map.
   *
   * @typeparam T  A type of component.
   */
  export type Item<T extends object> = Map<T> | string;

  /**
   * Per-attribute definition options.
   *
   * This is a map with attribute names as keys and their state update instructions as values.
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
