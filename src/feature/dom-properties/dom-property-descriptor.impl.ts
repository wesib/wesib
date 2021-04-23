import { PropertyAccessorDescriptor } from '@proc7ts/primitives';
import { ComponentElement, ComponentProperty, ComponentSlot } from '../../component';
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
    get: function (this: ComponentElement<ComponentType>): TValue {
      return ComponentSlot.of(this).context?.component[componentPropertyKey] as TValue;
    },
    set: writable
        ? function (this: ComponentElement<ComponentType>, value: TValue) {
          ComponentSlot.of(this).whenReady(({
            component,
          }) => component[componentPropertyKey] = value);
        }
        : undefined,
  };

  return { key, descriptor };
}
