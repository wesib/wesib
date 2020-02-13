/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { noop } from 'call-thru';
import { Class, PropertyAccessorDescriptor } from '../../common';
import { ComponentContext, ComponentProperty, ComponentPropertyDecorator } from '../../component';
import { ComponentClass } from '../../component/definition';
import { DomPropertiesSupport } from './dom-properties-support.feature';
import { DomPropertyDef } from './dom-property-def';
import { DomPropertyRegistrar } from './dom-property-registrar';
import { DomPropertyUpdateCallback, propertyStateUpdate } from './property-state-update.impl';

/**
 * Component property decorator that declares a property to add to custom element created for this component.
 *
 * The value of declared element's property will be read from and written to decorated one.
 *
 * This decorator can be applied both to plain properties and to property accessors.
 *
 * @category Feature
 * @typeparam T  A type of decorated component class.
 * @param def  Custom element property definition.
 *
 * @returns Component property decorator.
 */
export function DomProperty<V = any, T extends ComponentClass = Class>(
    def: DomPropertyDef<T> = {},
): ComponentPropertyDecorator<V, T> {
  return ComponentProperty(descriptor => {

    const { key, access } = descriptor;
    const name = def.propertyKey || key;
    const desc = domPropertyDescriptor(key, descriptor, def);

    return {
      componentDef: {
        feature: {
          needs: DomPropertiesSupport,
        },
        define(definitionContext) {
          definitionContext.get(DomPropertyRegistrar)(name, desc);
        },
      },
      access(component) {

        const accessor = access(component);
        const updateState: DomPropertyUpdateCallback<InstanceType<T>> = def.updateState !== false
            ? propertyStateUpdate(key, def.updateState)
            : noop;

        return {
          get(): V {
            return accessor.get();
          },
          set(newValue: V) {

            const oldValue = component[key];

            accessor.set(newValue);
            updateState.call(component, newValue, oldValue);
          },
        };
      },
    };
  });
}

/**
 * Component method decorator that declares a method to add to custom element created for this component.
 *
 * This is just an alias of {@link DomProperty @DomProperty} decorator.
 *
 * @category Feature
 */
export { DomProperty as DomMethod };

/**
 * @internal
 */
function domPropertyDescriptor<V>(
    propertyKey: string | symbol,
    propertyDesc: ComponentProperty.Descriptor<V>,
    {
      configurable = propertyDesc.configurable,
      enumerable = propertyDesc.enumerable,
      writable = propertyDesc.writable,
    }: DomPropertyDef,
): PropertyAccessorDescriptor<V> {
  return {
    configurable,
    enumerable,
    get: function (this: any) {
      return (ComponentContext.of(this).component as any)[propertyKey];
    },
    set: writable
        ? function (this: any, value: any) {
          (ComponentContext.of(this).component as any)[propertyKey] = value;
        }
        : undefined,
  };
}
