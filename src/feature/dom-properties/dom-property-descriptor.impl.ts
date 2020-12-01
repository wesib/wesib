import { PropertyAccessorDescriptor } from '@proc7ts/primitives';
import { ComponentContext, ComponentContextHolder, ComponentProperty } from '../../component';
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

  type ComponentType = { [TKey in ComponentProperty.Descriptor<V>['key']]: V };

  const componentPropertyKey = propertyDesc.key as string;
  const descriptor: PropertyAccessorDescriptor<V> = {
    configurable,
    enumerable,
    get: function (this: ComponentContextHolder): V {
      return ComponentContext.of<ComponentType>(this).component[componentPropertyKey];
    },
    set: writable
        ? function (this: ComponentContextHolder, value: V) {
          ComponentContext.of<ComponentType>(this).component[componentPropertyKey] = value;
        }
        : undefined,
  };

  return { key, descriptor };
}
