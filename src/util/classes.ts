import { Class } from '../types';

/**
 * @internal
 */
export function superClass(type: Class, satisfying: (type: Class) => boolean = () => true): Class | undefined {

  const prototype = Object.getPrototypeOf(type.prototype);

  if (prototype == null) {
    return;
  }

  const superType = prototype.constructor as Class;

  if (satisfying(superType)) {
    return superType;
  }

  return superClass(superType, satisfying);
}
