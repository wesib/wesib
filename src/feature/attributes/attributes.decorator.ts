import { StatePath } from 'fun-events';
import { TypedClassDecorator } from '../../common';
import { isArray } from '../../common/types';
import { ComponentClass, ComponentDef } from '../../component';
import { FeatureDef } from '../feature-def';
import { AttributeUpdateReceiver } from './attribute-def';
import { AttributeRegistrar } from './attribute-registrar';
import { attributeStateUpdate } from './attribute-state-update';
import { AttributesSupport } from './attributes-support.feature';

/**
 * Creates a component class decorator declaring supported custom element's attributes.
 *
 * This decorator automatically enables `AttributesSupport` feature.
 *
 * @param items Attributes definition options. Either an attribute definition item, or an array of such items.
 *
 * @return New component class decorator.
 */
export function Attributes<T extends ComponentClass = any>(
    items: Attributes.Item<T> | readonly Attributes.Item<T>[]):
    TypedClassDecorator<T> {
  return componentType => {
    FeatureDef.define(componentType, { needs: AttributesSupport });
    ComponentDef.define(
        componentType,
        {
          define(defContext) {

            const registrar = defContext.get(AttributeRegistrar);

            if (isArray<Attributes.Item<T>>(items)) {
              items.forEach(defineByItem);
            } else {
              defineByItem(items);
            }

            function defineByItem(item: Attributes.Item<T>) {
              if (typeof item === 'string') {
                registrar(item, attributeStateUpdate(item));
              } else {
                Object.keys(item).forEach(name => {
                  registrar(name, attributeStateUpdate(name, item[name]));
                });
              }
            }
          },
        });
  };
}

export namespace Attributes {

  /**
   * Attribute definition item.
   *
   * This is either an attribute name, or a per-attribute options map.
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
   */
  export interface Map<T extends object> {
    readonly [name: string]: boolean | StatePath | AttributeUpdateReceiver<T>;
  }

}
