import { hyphenateDecapName } from '@frontmeans/httongue';
import { AttributeDef } from './attribute-def';
import { AttributeChangedCallback, AttributeDescriptor } from './attribute-descriptor';
import { attributeStateUpdate } from './attribute-state-update.impl';

/**
 * @internal
 */
export function parseAttributeDescriptor<T extends object>(
    target: T,
    propertyKey: string | symbol,
    def?: AttributeDef<T> | string,
): AttributeDescriptor<T> {

  let name: string;
  let change: AttributeChangedCallback<T>;

  if (typeof def === 'string') {
    name = hyphenateDecapName(def);
    change = attributeStateUpdate(name);
  } else {
    if (def && def.name) {
      name = hyphenateDecapName(def.name);
    } else if (typeof propertyKey !== 'string') {
      throw new TypeError(
          'Attribute name is required as property key is not a string: '
          + `${target.constructor.name}.prototype.${String(propertyKey)}`,
      );
    } else {
      name = hyphenateDecapName(propertyKey);
    }

    change = attributeStateUpdate(name, def && def.updateState);
  }

  return { name, change };
}
