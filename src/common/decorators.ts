/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import {
  Class,
  fieldAccessorDescriptor,
  PropertyAccessorDescriptor,
  toPropertyAccessorDescriptor,
} from '@proc7ts/primitives';

/**
 * Typed class decorator.
 *
 * @category Utility
 * @typeParam TClass - A type of class to decorate.
 */
export type TypedClassDecorator<TClass extends Class> = (type: TClass) => TClass | void;

/**
 * Typed property decorator.
 *
 * @category Utility
 * @typeParam TClass - A type of class the decorated property belongs to.
 */
export type TypedPropertyDecorator<TClass extends Class> =
    <TValue>(
        target: InstanceType<TClass>,
        propertyKey: string | symbol,
        descriptor?: TypedPropertyDescriptor<TValue>,
    ) => any | void;

/**
 * Property decorator helper converting a field or property to the one with accessor (`get` and optionally `set`).
 *
 * @category Utility
 * @typeParam T - A type of target object.
 * @typeParam TValue - A property value type.
 * @param target - Target object containing the property.
 * @param propertyKey - Target property key.
 * @param desc - Target property descriptor, or `undefined` for object fields.
 * @param updateDescriptor - Descriptor updater. Accepts the accessor descriptor as the only argument. If returns
 * a descriptor, then it is applied to the property. Otherwise the target property descriptor is never updated.
 *
 * @returns Updated property descriptor to return from decorator to apply to the property, or `undefined` if there is
 * nothing to update.
 */
export function decoratePropertyAccessor<T, TValue>(
    target: T,
    propertyKey: string | symbol,
    desc: TypedPropertyDescriptor<TValue> | undefined,
    updateDescriptor: (desc: PropertyAccessorDescriptor<TValue>) => PropertyAccessorDescriptor<TValue>,
): PropertyAccessorDescriptor<TValue> | undefined {

  const isField = !desc;
  const accessorDesc = desc
      ? toPropertyAccessorDescriptor(desc)
      : fieldAccessorDescriptor(target, propertyKey as keyof T) as unknown as PropertyAccessorDescriptor<TValue>;
  const updatedDesc = updateDescriptor(accessorDesc);

  if (isField && updatedDesc) {
    Object.defineProperty(target, propertyKey, updatedDesc);
    return;
  }

  return updatedDesc;
}
