/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { Class } from './classes';
import { fieldAccessorDescriptor, PropertyAccessorDescriptor, toPropertyAccessorDescriptor } from './reflect';

/**
 * Typed class decorator.
 *
 * @category Utility
 * @typeparam T  A type of class to decorate.
 */
export type TypedClassDecorator<T extends Class> = (type: T) => T | void;

/**
 * Typed property decorator.
 *
 * @category Utility
 * @typeparam T  A type of class the decorated property belongs to.
 */
export type TypedPropertyDecorator<T extends Class> =
    <V>(target: InstanceType<T>, propertyKey: string | symbol, descriptor?: TypedPropertyDescriptor<V>) => any | void;

/**
 * Property decorator helper converting a field or property to the one with accessor (`get` and optionally `set`).
 *
 * @category Utility
 * @typeparam T  A type of target object.
 * @typeparam V  A property value type.
 * @param target  Target object containing the property.
 * @param propertyKey  Target property key.
 * @param desc  Target property descriptor, or `undefined` for object fields.
 * @param updateDescriptor  Descriptor updater. Accepts the accessor descriptor as the only argument. If returns
 * a descriptor, then it is applied to the property. Otherwise the target property descriptor is never updated.
 *
 * @returns Updated property descriptor to return from decorator to apply to the property, or `undefined` if there is
 * nothing to update.
 */
export function decoratePropertyAccessor<T, V>(
    target: T,
    propertyKey: string | symbol,
    desc: TypedPropertyDescriptor<V> | undefined,
    updateDescriptor: (desc: PropertyAccessorDescriptor<V>) => PropertyAccessorDescriptor<V> | undefined,
): PropertyAccessorDescriptor<V> | undefined {

  const isField = !desc;
  const accessorDesc: PropertyAccessorDescriptor<V> = desc
      ? toPropertyAccessorDescriptor(desc)
      : fieldAccessorDescriptor(target, propertyKey as keyof T) as any;
  const updatedDesc = updateDescriptor(accessorDesc);

  if (isField && updatedDesc) {
    Object.defineProperty(target, propertyKey, updatedDesc);
    return;
  }

  return updatedDesc || accessorDesc;
}
