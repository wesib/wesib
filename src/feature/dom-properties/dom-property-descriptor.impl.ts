import { PropertyAccessorDescriptor } from '../../common';
import { ComponentContext, ComponentProperty } from '../../component';
import { DomPropertyDef } from './dom-property-def';
import { DomPropertyDescriptor } from './dom-property-descriptor';

/**
 * @internal
 */
export function domPropertyDescriptor<V>(
    propertyDesc: ComponentProperty.Descriptor<V>,
    {
      propertyKey: key = propertyDesc.key,
      configurable = propertyDesc.configurable,
      enumerable = propertyDesc.enumerable,
      writable = propertyDesc.writable,
    }: DomPropertyDef,
): DomPropertyDescriptor {

  const componentPropertyKey = propertyDesc.key;
  const descriptor: PropertyAccessorDescriptor<V> = {
    configurable,
    enumerable,
    get: function (this: any) {
      return (ComponentContext.of(this).component as any)[componentPropertyKey];
    },
    set: writable
        ? function (this: any, value: any) {
          (ComponentContext.of(this).component as any)[componentPropertyKey] = value;
        }
        : undefined,
  };

  return { key, descriptor };
}
