import { ComponentClass } from '../../component/definition';
import { AttributeDef } from './attribute-def';
import { AttributeChangedCallback, AttributeDescriptor } from './attribute-descriptor';
import { attributeStateUpdate } from './attribute-state-update.impl';
import { property2attributeName } from './property2attribute-name';

/**
 * @internal
 */
export function parseAttributeDescriptor<T extends ComponentClass>(
    target: InstanceType<T>,
    propertyKey: string | symbol,
    opts?: AttributeDef<InstanceType<T>> | string,
): AttributeDescriptor<InstanceType<T>> {

  let name: string;
  let change: AttributeChangedCallback<InstanceType<T>>;

  if (typeof opts === 'string') {
    name = property2attributeName(opts);
    change = attributeStateUpdate(name);
  } else {
    if (opts && opts.name) {
      name = property2attributeName(opts.name);
    } else if (typeof propertyKey !== 'string') {
      throw new TypeError(
          'Attribute name is required as property key is not a string: '
          + `${target.constructor.name}.prototype.${String(propertyKey)}`,
      );
    } else {
      name = property2attributeName(propertyKey);
    }

    change = attributeStateUpdate(name, opts && opts.updateState);
  }

  return { name, change };
}
