/**
 * Converts an object field to property accessor.
 *
 * Defines a new property with the given name in the target object and returns its descriptor.
 *
 * @param <T> The type of target object.
 * @param <K> Target object property keys type.
 * @param target The object containing target property.
 * @param propertyKey Target property key.
 *
 * @return New property descriptor.
 */
export function field2accessor<T, K extends keyof T = keyof T>(
    target: T,
    propertyKey: K): TypedPropertyDescriptor<T[K]> {

  let value: T[K] = target[propertyKey];
  const desc: TypedPropertyDescriptor<T[K]> = {
    configurable: true,
    enumerable: true,
    get() {
      return value;
    },
    set(newValue) {
      value = newValue;
    },
  };

  Object.defineProperty(target, propertyKey, desc);

  return desc;
}
