/**
 * Converts an object field to property accessor.
 *
 * Defines a new property with the given name in the target object and returns its descriptor.
 *
 * The converted descriptor is always configurable, enumerable, and writable.
 *
 * @param <T> The type of target object.
 * @param <K> Target object property keys type.
 * @param target The object containing target field.
 * @param fieldKey Target field key.
 *
 * @return New property accessor descriptor.
 */
export function field2accessor<T, K extends keyof T>(target: T, fieldKey: K): PropertyAccessorDescriptor<T[K]> {

  const desc = fieldAccessorDescriptor(target, fieldKey);

  Object.defineProperty(target, fieldKey, desc);

  return desc;
}

/**
 * Creates an property accessor descriptor for the given field.
 *
 * @param <T> The type of target object.
 * @param <K> Target object property keys type.
 * @param target The object containing target field.
 * @param fieldKey Target field key.
 */
export function fieldAccessorDescriptor<T, K extends keyof T>(
    target: T,
    fieldKey: K): PropertyAccessorDescriptor<T[K]> {

  let value: T[K] = target[fieldKey];

  return {
    configurable: true,
    enumerable: true,
    get() {
      return value;
    },
    set(newValue) {
      value = newValue;
    },
  };
}

/**
 * Property accessor descriptor. I.e. the one with `get` and `set` functions.
 */
export interface PropertyAccessorDescriptor<V> extends TypedPropertyDescriptor<V> {
  enumerable?: boolean;
  configurable?: boolean;
  writable?: undefined;
  value?: undefined;
  get?: () => V;
  set?: (value: V) => void;
}

/**
 * Detects whether the given property descriptor is the one of property accessor.
 *
 * @param desc Target property descriptor.
 *
 * @return `true` if the descriptor has no `value` or `writable` attributes set.
 */
export function isPropertyAccessorDescriptor<V>(
    desc: TypedPropertyDescriptor<V>): desc is PropertyAccessorDescriptor<V> {
  return desc.value === undefined && desc.writable === undefined;
}

/**
 * Converts a property descriptor to property accessor descriptor.
 *
 * @param desc Target property descriptor.
 *
 * @return Either an accessor descriptor constructed from data descriptor, or `desc` if it is an accessor descriptor
 * already.
 */
export function toPropertyAccessorDescriptor<V>(desc: TypedPropertyDescriptor<V>): PropertyAccessorDescriptor<V> {
  if (isPropertyAccessorDescriptor(desc)) {
    return desc;
  }

  let value = desc.value as V;

  const accessorDesc: PropertyAccessorDescriptor<V> = {
    ...desc,
    writable: undefined,
    value: undefined,
    get() {
      return value;
    },
  };

  if (desc.writable) {
    accessorDesc.set = (newValue: V) => {
      value = newValue;
    };
  }

  delete accessorDesc.writable;
  delete accessorDesc.value;

  return accessorDesc;
}

/**
 * Property decorator helper converting a field or property to the one with accessor (`get` and optionally `set`).
 *
 * @param <T> A type of target object.
 * @param <V> A property value type.
 * @param target Target object containing the property.
 * @param propertyKey Target property key.
 * @param desc Target property descriptor, or `undefined` for object fields.
 * @param updateDescriptor Descriptor updater. Accepts the accessor descriptor as the only argument. If returns
 * a descriptor, then it is applied to the property. Otherwise the target property descriptor is never updated.
 *
 * @returns Updated property descriptor to return from decorator to apply to the property, or `undefined` if there is
 * nothing to update.
 */
export function decoratePropertyAccessor<T, V>(
    target: T,
    propertyKey: string | symbol,
    desc: TypedPropertyDescriptor<V> | undefined,
    updateDescriptor: (desc: PropertyAccessorDescriptor<V>) => PropertyAccessorDescriptor<V> | undefined):
    PropertyAccessorDescriptor<V> | undefined {

  const isField = !desc;
  const accessorDesc: PropertyAccessorDescriptor<V> =
      desc ? toPropertyAccessorDescriptor(desc) : fieldAccessorDescriptor(target, propertyKey as keyof T) as any;
  const updatedDesc = updateDescriptor(accessorDesc);

  if (isField && updatedDesc) {
    Object.defineProperty(target, propertyKey, updatedDesc);
    return;
  }

  return updatedDesc || accessorDesc;
}
