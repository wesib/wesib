import { PropertyAccessorDescriptor } from '@proc7ts/primitives';
import { ComponentContext, ComponentContextHolder, ComponentProperty } from '../../component';
import { DomPropertyDef } from './dom-property-def';
import { DomPropertyDescriptor } from './dom-property-descriptor';

/**
 * @internal
 */
export function domPropertyDescriptor<TValue>(
    propertyDesc: ComponentProperty.Descriptor<TValue>,
    {
      propertyKey: key = propertyDesc.key,
      configurable = propertyDesc.configurable,
      enumerable = propertyDesc.enumerable,
      writable = propertyDesc.writable,
    }: DomPropertyDef,
): DomPropertyDescriptor {

  type ComponentType = { [TKey in ComponentProperty.Descriptor<TValue>['key']]: TValue };

  const componentPropertyKey = propertyDesc.key as string;
  const descriptor: PropertyAccessorDescriptor<TValue> = {
    configurable,
    enumerable,
    get: function (this: ComponentContextHolder): TValue {
      return ComponentContext.of<ComponentType>(this).component[componentPropertyKey];
    },
    set: writable
        ? function (this: ComponentContextHolder, value: TValue) {
          ComponentContext.of<ComponentType>(this).component[componentPropertyKey] = value;
        }
        : undefined,
  };

  return { key, descriptor };
}
