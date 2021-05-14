import { AeComponentMember, ComponentElement, ComponentSlot } from '../../component';
import { ComponentClass } from '../../component/definition';
import { DomPropertyDef } from './dom-property-def';
import { DomPropertyDescriptor } from './dom-property-descriptor';

/**
 * @internal
 */
export function domPropertyDescriptor<TValue extends TUpdate, TClass extends ComponentClass, TUpdate>(
    amended: AeComponentMember<TValue, TClass, TUpdate>,
    {
      propertyKey: key = amended.key,
      configurable = amended.configurable,
      enumerable = amended.enumerable,
      writable = amended.writable,
    }: DomPropertyDef,
): DomPropertyDescriptor {

  type ComponentType = { [K in AeComponentMember<TValue, TClass, TUpdate>['key']]: TValue };

  const componentMemberKey = amended.key as string;
  const descriptor: PropertyDescriptor = {
    configurable,
    enumerable,
    get: function (this: ComponentElement<ComponentType>): TValue {
      return ComponentSlot.of(this).rebind()?.component[componentMemberKey] as TValue;
    },
    set: writable
        ? function (this: ComponentElement<ComponentType>, value: TValue) {
          ComponentSlot.of(this).whenReady(({
            component,
          }) => component[componentMemberKey] = value);
        }
        : undefined,
  };

  return { key, descriptor };
}
