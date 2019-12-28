import { ComponentClass } from '../../component/definition';
import { AttributeDef } from './attribute-def';
import { AttributeChangedCallback } from './attribute-registrar';
import { attributeStateUpdate } from './attribute-state-update.impl';

/**
 * @internal
 */
export function parseAttributeDef<T extends ComponentClass>(
    target: InstanceType<T>,
    propertyKey: string | symbol,
    opts?: AttributeDef<InstanceType<T>> | string,
) {

  let name: string;
  let updateState: AttributeChangedCallback<InstanceType<T>>;

  if (typeof opts === 'string') {
    name = opts;
    updateState = attributeStateUpdate(name);
  } else {
    if (opts && opts.name) {
      name = opts.name;
    } else if (typeof propertyKey !== 'string') {
      throw new TypeError(
          'Attribute name is required, as property key is not a string: ' +
          `${target.constructor.name}.${propertyKey.toString()}`,
      );
    } else {
      name = propertyKey;
    }

    updateState = attributeStateUpdate(name, opts && opts.updateState);
  }

  return { name, updateState };
}
