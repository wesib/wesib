/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { decoratePropertyAccessor, PropertyAccessorDescriptor, TypedPropertyDecorator } from '../../common';
import { ComponentContext, ComponentDef } from '../../component';
import { ComponentClass } from '../../component/definition';
import { DomPropertiesSupport } from './dom-properties-support.feature';
import { DomPropertyDef } from './dom-property-def';
import { DomPropertyRegistrar } from './dom-property-registrar';
import { propertyStateUpdate } from './property-state-update.impl';

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
export function DomProperty<T extends ComponentClass>(def: DomPropertyDef<T> = {}): TypedPropertyDecorator<T> {
  return <V>(target: InstanceType<T>, propertyKey: string | symbol, propertyDesc?: TypedPropertyDescriptor<V>) => {

    const componentType = target.constructor as T;

    let result: TypedPropertyDescriptor<V> | undefined;

    if (def.updateState !== false) {

      const updateState: any = propertyStateUpdate(propertyKey, def.updateState);

      result = decoratePropertyAccessor(target, propertyKey, propertyDesc, dsc => {

        const setter = dsc.set;

        if (!setter) {
          return;
        }

        return {
          ...dsc,
          set: function (this: InstanceType<T>, newValue: V) {

            const oldValue = (this as any)[propertyKey];

            setter.call(this, newValue);
            updateState.call(this, newValue, oldValue);
          },
        };
      });
    }

    const name = def.propertyKey || propertyKey;
    const desc = domPropertyDescriptor(propertyKey, propertyDesc, def);

    ComponentDef.define(
        componentType,
        {
          define(definitionContext) {
            definitionContext.get(DomPropertyRegistrar)(name, desc);
          },
          feature: {
            needs: DomPropertiesSupport,
          },
        },
    );

    return result;
  };
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
    propertyDesc: TypedPropertyDescriptor<V> | undefined,
    {
      configurable,
      enumerable,
      writable,
    }: DomPropertyDef,
): PropertyAccessorDescriptor<V> {
  if (!propertyDesc) {
    // Component object property
    if (enumerable == null) {
      enumerable = true;
    }
    if (configurable == null) {
      configurable = true;
    }
    if (writable == null) {
      writable = true;
    }
  } else {
    // Component property accessor
    if (configurable == null) {
      configurable = propertyDesc.configurable === true;
    }
    if (enumerable == null) {
      enumerable = propertyDesc.enumerable === true;
    }
    if (!propertyDesc.set) {
      // No setter. Element property is not writable.
      writable = false;
    } else if (writable == null) {
      // There is a setter. Element property is writable by default.
      writable = true;
    }
  }

  const desc: PropertyAccessorDescriptor<V> = {
    configurable,
    enumerable,
    get: function (this: HTMLElement) {
      return (ComponentContext.of(this).component as any)[propertyKey];
    },
  };

  if (writable) {
    desc.set = function (this: HTMLElement, value: any) {
      (ComponentContext.of(this).component as any)[propertyKey] = value;
    };
  }

  return desc;
}
