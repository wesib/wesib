import { StatePath } from 'fun-events';
import { decoratePropertyAccessor, PropertyAccessorDescriptor, TypedPropertyDecorator } from '../../common';
import { Component, ComponentClass, ComponentContext, ComponentDef } from '../../component';
import { FeatureDef } from '../feature-def';
import { DomPropertiesSupport } from './dom-properties-support.feature';
import { DomPropertyRegistrar } from './dom-property-registrar';
import { propertyStateUpdate } from './property-state-update';

/**
 * Component property decorator that declares a property to add to custom element created for this component.
 *
 * The value of declared element's property will be read from and written to decorated one.
 *
 * This decorator can be applied both to plain properties and to property accessors.
 *
 * @param opts Custom element property options.
 *
 * @returns Component property decorator.
 */
export function DomProperty<T extends ComponentClass>(opts: DomProperty.Opts<T> = {}): TypedPropertyDecorator<T> {
  return <V>(target: InstanceType<T>, propertyKey: string | symbol, propertyDesc?: TypedPropertyDescriptor<V>) => {

    const componentType = target.constructor as T;

    FeatureDef.define(componentType, { need: DomPropertiesSupport });

    let result: TypedPropertyDescriptor<V> | undefined;

    if (opts.updateState !== false) {

      const updateState: any = propertyStateUpdate(propertyKey, opts.updateState);

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

    const name = opts.propertyKey || propertyKey;
    const desc = domPropertyDescriptor(propertyKey, propertyDesc, opts);

    ComponentDef.define(
        componentType,
        {
          define(definitionContext) {
            definitionContext.get(DomPropertyRegistrar)(name, desc);
          }
        });

    return result;
  };
}

/**
 * Component method decorator that declares a method to add to custom element created for this component.
 *
 * This is just an alias of `@DomProperty` decorator.
 */
export { DomProperty as DomMethod };

export namespace DomProperty {

  /**
   * Custom element property options.
   *
   * This is an parameter to `@DomProperty` decorator applied to component property.
   */
  export interface Opts<T extends object> {

    /**
     * Property key.
     *
     * Decorated property key is used by default.
     */
    propertyKey?: PropertyKey;

    /**
     * Whether the declared property should be configurable.
     *
     * Defaults to `configurable` attribute of decorated property.
     */
    configurable?: boolean;

    /**
     * Whether the declared property should be enumerable.
     *
     * Defaults to `enumerable` attribute of decorated property.
     */
    enumerable?: boolean;

    /**
     * Whether the declared property should accept new values.
     *
     * The property can not be writable if the decorated property is not writable.
     *
     * Defaults to `writable` attribute of decorated property.
     */
    writable?: boolean;

    /**
     * Whether to update the component state after this property changed.
     *
     * Either a DOM property updates consumer to call, or boolean value:
     * - when `false` the component state will not be updated.
     * - when `true` (the default value), then the component state will be updated with changed property key.
     */
    updateState?: boolean | StatePath | DomPropertyUpdateConsumer<T>;

  }

}

/**
 * DOM property updates consumer invoked after custom element property change.
 *
 * @param <T> A type of component.
 * @param <K> A type of component property keys.
 * @param this Component instance.
 * @param path The changed property state path in the form of `[StatePath.property, propertyKey]`.
 * @param newValue New property value.
 * @param oldValue Previous property value.
 */
export type DomPropertyUpdateConsumer<T extends object> = <K extends keyof T>(
    this: T,
    path: [typeof StatePath.property, K],
    newValue: T[K],
    oldValue: T[K]) => void;

function domPropertyDescriptor<V>(
    propertyKey: string | symbol,
    propertyDesc: TypedPropertyDescriptor<V> | undefined,
    {
      configurable,
      enumerable,
      writable,
    }: DomProperty.Opts<any>): PropertyAccessorDescriptor<V> {
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
    }
  };

  if (writable) {
    desc.set = function (this: HTMLElement, value: any) {
      (ComponentContext.of(this).component as any)[propertyKey] = value;
    };
  }

  return desc;
}
