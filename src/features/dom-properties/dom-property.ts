import { decoratePropertyAccessor } from '../../common';
import { Component, ComponentContext, ComponentType } from '../../component';
import { ComponentPropertyDecorator } from '../../decorators';
import { DomPropertiesDef } from './dom-properties-def';
import './dom-properties-def.ns';

/**
 * Web component property decorator that declares a property to add to custom HTML element created for this web
 * component.
 *
 * The value of declared HTML element's property will be read from and written to decorated one.
 *
 * This decorator cane be applied both to plain properties, and to property accessors.
 *
 * @param opts Custom HTML element property options.
 *
 * @returns Web component property decorator.
 */
export function DomProperty<T extends ComponentType>(opts: DomProperty.Opts<T> = {}): ComponentPropertyDecorator<T> {

  return <V>(target: InstanceType<T>, propertyKey: string | symbol, propertyDesc?: TypedPropertyDescriptor<V>) => {

    let result: TypedPropertyDescriptor<V> | undefined;

    if (opts.updateState !== false) {

      const updateState: DomPropertyUpdateConsumer<T> =
          typeof opts.updateState === 'function' ? opts.updateState : defaultUpdateState;

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

              const context = ComponentContext.find(this);

              // When called inside constructor the context is not set yet.
              // No need to refresh the state in that case.
              if (context) {
                updateState.call(this, propertyKey, newValue, oldValue); // Refresh the state.
              }
            },
          };
      });
    }

    const name = opts.name || propertyKey;
    const desc = domPropertyDescriptor(propertyKey, propertyDesc, opts);
    const constructor = target.constructor as T;

    DomPropertiesDef.define(constructor, { [name]: desc });

    return result;
  };
}

function defaultUpdateState<T extends object, K extends keyof T>(this: T, property: K, newValue: T[K], oldValue: T[K]) {
  ComponentContext.of(this).updateState(property, newValue, oldValue);
}

/**
 * Web component method decorator that declares a method to add to custom HTML element created for this web component.
 *
 * This is just an alias of `@DomProperty` decorator.
 */
export { DomProperty as DomMethod };

export namespace DomProperty {

  /**
   * Custom HTML element property options.
   *
   * This is an parameter to `@DomProperty` decorator applied to web component property.
   */
  export interface Opts<T extends object> {

    /**
     * Property name.
     *
     * Decorated property name is used by default.
     */
    name?: string | symbol;

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
     * - when `false` the component state will not be refreshed.
     * - when `true` (the default value), then the component state will be refreshed with property name
     * as changed value key.
     */
    updateState?: boolean | DomPropertyUpdateConsumer<T>;

  }

}

/**
 * DOM property updates consumer invoked after custom HTML element property change.
 *
 * @param <T> A type of web component.
 * @param <K> A type of web component property keys.
 * @param this Web component instance.
 * @param property The changed property name.
 * @param newValue New property value.
 * @param oldValue Previous property value.
 */
export type DomPropertyUpdateConsumer<T extends object> = <K extends keyof T>(
    this: T,
    attribute: K,
    newValue: T[K],
    oldValue: T[K]) => void;

function domPropertyDescriptor<V>(
    propertyKey: string | symbol,
    propertyDesc: TypedPropertyDescriptor<V> | undefined,
    {
      configurable,
      enumerable,
      writable,
    }: DomProperty.Opts<any>): PropertyDescriptor {
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

  const desc: TypedPropertyDescriptor<V> = {
    configurable,
    enumerable,
    get: function (this: HTMLElement) {
      return (Component.of(this) as any)[propertyKey];
    }
  };

  if (writable) {
    desc.set = function (this: HTMLElement, value: any) {
      (Component.of(this) as any)[propertyKey] = value;
    };
  }

  return desc;
}
