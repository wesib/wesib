import { Component, ComponentType } from '../../component';
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
 * @param opts Property definition.
 *
 * @returns Web component property decorator.
 */
export function DomProperty<T extends ComponentType>(opts: DomProperty.Opts = {}): ComponentPropertyDecorator<T> {
  return <V>(target: T['prototype'], propertyKey: string | symbol, propertyDesc?: TypedPropertyDescriptor<V>) => {

    const name = opts.name || propertyKey;
    const desc = domPropertyDescriptor(propertyKey, propertyDesc, opts);
    const constructor = target.constructor as T;

    DomPropertiesDef.define(constructor, { [name]: desc });
  };
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
  export interface Opts {

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

  }

}

function domPropertyDescriptor<V>(
    propertyKey: string | symbol,
    propertyDesc: TypedPropertyDescriptor<V> | undefined,
    {
      configurable,
      enumerable,
      writable,
    }: DomProperty.Opts): PropertyDescriptor {
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
