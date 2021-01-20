/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { Class, PropertyAccessorDescriptor, valueProvider } from '@proc7ts/primitives';
import { decoratePropertyAccessor } from '../common';
import { ComponentDef, ComponentDef__symbol } from './component-def';
import { Component, ComponentDecorator } from './component.decorator';
import { ComponentClass } from './definition';

/**
 * Component property decorator interface.
 *
 * Allows to construct a {@link ComponentDecorator component decorator} by declaring a virtual property to use instead
 * of decorated one.
 *
 * Constructed by {@link ComponentProperty} function.
 *
 * @category Core
 * @typeParam TValue - Property value type.
 * @typeParam TClass - A type of decorated component class.
 */
export interface ComponentPropertyDecorator<TValue, TClass extends ComponentClass = Class> {

  /**
   * Decorates component method.
   *
   * @typeParam TPropValue - Property value type.
   * @param proto - Decorated class prototype.
   * @param propertyKey - Decorated property key.
   * @param descriptor - Decorated property descriptor.
   *
   * @returns  Either updated property descriptor, or nothing.
   */
  <TPropValue extends TValue>(
      this: void,
      proto: InstanceType<TClass>,
      propertyKey: string | symbol,
      descriptor?: TypedPropertyDescriptor<TPropValue>,
  ): any | void;

  /**
   * Builds component decorator assuming the virtual property has the given value.
   *
   * @param value - Virtual property value.
   * @param key - Virtual property key. Defaults to {@link AnonymousComponentProperty__symbol}.
   *
   * @returns New component decorator.
   */
  As(
      this: void,
      value: TValue,
      key?: string | symbol,
  ): ComponentDecorator<TClass>;

  /**
   * Builds component decorator assuming the virtual property value is provided by the given `provider`.
   *
   * @param provider - Virtual property read-only value provider.
   * @param key - Virtual property key. Defaults to {@link AnonymousComponentProperty__symbol}.
   *
   * @returns New component decorator.
   */
  By(
      this: void,
      provider: ComponentProperty.Provider<TValue, InstanceType<TClass>>,
      key?: string | symbol,
  ): ComponentDecorator<TClass>;

  /**
   * Builds component decorator assuming the decorated property is available via the given `accessor`.
   *
   * @param accessor - Virtual property accessor.
   * @param key - Virtual property key. Defaults to {@link AnonymousComponentProperty__symbol}.
   *
   * @returns New component decorator.
   */
  With(
      this: void,
      accessor: ComponentProperty.Accessor<TValue, InstanceType<TClass>>,
      key?: string | symbol,
  ): ComponentDecorator<TClass>;

  /**
   * Builds component decorator assuming the decorated property is bound to component with by the given `binder`.
   *
   * @param binder - A binder of virtual property accessor
   * @param key - Virtual property key. Defaults to {@link AnonymousComponentProperty__symbol}..
   *
   * @returns New component decorator.
   */
  Bind(
      this: void,
      binder: ComponentProperty.Binder<TValue, InstanceType<TClass>>,
      key?: string | symbol,
  ): ComponentDecorator<TClass>;

}

/**
 * @category Core
 */
export namespace ComponentProperty {

  /**
   * Component property value provider signature.
   *
   * This function will be called each time the property value is requested.
   *
   * @typeParam TValue - Property value type.
   * @typeParam T - A type of component.
   */
  export type Provider<TValue, T extends object = any> =
  /**
   * @param component - Component instance.
   * @param key - Target property key.
   *
   * @returns Property value.
   */
      (
          this: void,
          component: T,
          key: string | symbol,
      ) => TValue;

  /**
   * Component property accessor.
   *
   * Allows to read and write property value.
   *
   * @typeParam TValue - Property value type.
   * @typeParam T - A type of component.
   */
  export interface Accessor<TValue, T extends object = any> {

    /**
     * Reads property value.
     *
     * May throw if the property is not readable.
     *
     * @param component - Target component instance.
     * @param key - Property key.
     *
     * @returns Property value.
     */
    get(this: void, component: T, key: string | symbol): TValue;

    /**
     * Assigns new property value.
     *
     * May throw is the property is not writable.
     *
     * @param component - Target component instance.
     * @param value - New property value.
     * @param key - Property key.
     */
    set(this: void, component: T, value: TValue, key: string | symbol): void;

  }

  /**
   * Property accessor binder signature.
   *
   * This is a function that binds a {@link BoundAccessor property accessor} to target component.
   *
   * @typeParam TValue - Property value type.
   * @typeParam T - A type of component.
   */
  export type Binder<TValue, T extends object = any> =
  /**
   * @param component - Target component to bind property accessor to.
   * @param key - Property key.
   *
   * @returns Property accessor bound to `component`.
   */
      (
          this: void,
          component: T,
          key: string | symbol,
      ) => BoundAccessor<TValue>;

  export interface BoundAccessor<TValue> {

    /**
     * Reads bound component's property value.
     *
     * An attempt to read the value would throw when omitted.
     *
     * @returns Property value.
     */
    get?(): TValue;

    /**
     * Assigns bound component's new property value.
     *
     * An attempt to assign the value would throw when omitted.
     *
     * @param value - New property value.
     */
    set?(value: TValue): void;

  }

  /**
   * Component property descriptor.
   *
   * Passed to {@link Definer property definer} by {@link ComponentProperty} function to construct a {@link Definition
   * property definition}.
   *
   * @typeParam TValue - Property value type.
   * @typeParam TClass - A type of component class.
   */
  export interface Descriptor<TValue, TClass extends ComponentClass = Class> {

    /**
     * Component class constructor.
     */
    readonly type: TClass;

    /**
     * Component property key.
     */
    readonly key: string | symbol;

    /**
     * Whether the property is initially writable.
     *
     * This can be changed by {@link Definition.get property read definition}.
     */
    readonly readable: boolean;

    /**
     * Whether the property is initially writable.
     *
     * This can be changed by {@link Definition.set property assignment definition}.
     */
    readonly writable: boolean;

    /**
     * Whether the property is initially enumerable.
     *
     * This can be changed by {@link Definition.enumerable property definition}.
     */
    readonly enumerable: boolean;

    /**
     * Whether the property is initially configurable.
     *
     * This can be changed by {@link Definition.configurable property definition}.
     */
    readonly configurable: boolean;

    /**
     * Reads property value.
     *
     * May throw if the property is not readable.
     *
     * @param component - Target component instance.
     *
     * @returns Property value.
     */
    get(this: void, component: InstanceType<TClass>): TValue;

    /**
     * Assigns new property value.
     *
     * May throw is the property is not writable.
     *
     * @param component - Target component instance.
     * @param value - New property value.
     */
    set(this: void, component: InstanceType<TClass>, value: TValue): void;

  }

  /**
   * Component property definition builder signature.
   *
   * This is a function called by {@link ComponentProperty} to define the property.
   *
   * @typeParam TValue - Property value type.
   * @typeParam TClass - A type of component class.
   */
  export type Definer<TValue, TClass extends ComponentClass = Class> =
  /**
   * @param descriptor - Component property descriptor.
   *
   * @returns Component property definition. Or nothing if the property definition is not to be changed.
   */
      (
          this: void,
          descriptor: Descriptor<TValue, TClass>,
      ) => Definition<TValue, TClass> | void;

  /**
   * Property definition to apply to existing property.
   *
   * When applying to decorated property, this definition updates its definition.
   *
   * When applying to virtual property assumed by one of {@link ComponentPropertyDecorator} methods, most of returned
   * values ignored. Except for {@link Definition.componentDef component definition}, {@link Definition.get value
   * reader}, and {@link Definition.set value setter}.
   *
   * @typeParam TValue - Property value type.
   * @typeParam TClass - A type of component class.
   */
  export interface Definition<TValue, TClass extends ComponentClass = Class> {

    /**
     * Component definition to apply to component.
     *
     * When specified, it is used to enable certain functionality for decorated (or virtual) property.
     */
    readonly componentDef?: ComponentDef<InstanceType<TClass>>;

    /**
     * Whether to make the property enumerable.
     *
     * When specified, it is used as `enumerable` attribute value of decorated property descriptor.
     */
    readonly enumerable?: boolean;

    /**
     * Whether to make the property configurable.
     *
     * When specified, it is used as `configurable` attribute value of decorated property descriptor.
     */
    readonly configurable?: boolean;

    /**
     * Reads property value.
     *
     * When specified it changes how the property value is read.
     *
     * When neither {@link get}, nor {@link set} specified, the property access does not change.
     *
     * @param component - Target component instance.
     * @param key - Property key.
     *
     * @returns Property value.
     */
    get?(this: void, component: InstanceType<TClass>, key: string | symbol): TValue;

    /**
     * Assigns new property value.
     *
     * When specified it changes how the property value is assigned.
     *
     * When neither {@link get}, nor {@link set} specified, the property access does not change.
     *
     * @param component - Target component instance.
     * @param value - New property value.
     * @param key - Property key.
     */
    set?(this: void, component: InstanceType<TClass>, value: TValue, key: string | symbol): void;

  }

}

/**
 * Anonymous component property key.
 *
 * Used as a default virtual property key.
 *
 * @category Core
 */
export const AnonymousComponentProperty__symbol = (/*#__PURE__*/ Symbol('anonymous-component-property'));

/**
 * Decorator of component property.
 *
 * Updates decorated property and component definition. Can be converted to {@link ComponentDecorator component
 * decorator} by calling appropriate method of returned decorator instance.
 *
 * @category Core
 * @typeParam TValue - Decorated property value type.
 * @typeParam TClass - A type of decorated component class.
 * @param define - Component property definition builder.
 *
 * @returns Component property decorator.
 */
export function ComponentProperty<TValue, TClass extends ComponentClass = Class>(
    define: ComponentProperty.Definer<TValue, TClass>,
): ComponentPropertyDecorator<TValue, TClass> {

  const decorator = (
      proto: InstanceType<TClass>,
      propertyKey: string | symbol,
      descriptor?: TypedPropertyDescriptor<TValue>,
  ): any | void => decoratePropertyAccessor(
      proto,
      propertyKey,
      descriptor,
      desc => {

        const { get: getValue, set: setValue } = desc;
        const type = proto.constructor as TClass;
        const { get, set, configurable, enumerable, componentDef = {} } = define({
          type,
          key: propertyKey,
          readable: !!desc.get,
          writable: !!desc.set,
          enumerable: !!desc.enumerable,
          configurable: !!desc.configurable,
          get: getValue
              ? ((component: InstanceType<TClass>) => getValue.call(component))
              : notReadableAccessor(propertyKey),
          set: setValue
              ? ((component, value) => setValue.call(component, value))
              : notWritableAccessor(propertyKey),
        }) || {};

        ComponentDef.define(type, componentDef);

        const updated: PropertyAccessorDescriptor<TValue> = {
          ...desc,
          configurable: configurable ?? desc.configurable,
          enumerable: enumerable ?? desc.enumerable,
        };

        if (get || set) {
          updated.get = get && function (this: InstanceType<TClass>) {
            return get(this, propertyKey);
          };
          updated.set = set && function (this: InstanceType<TClass>, value: TValue) {
            set(this, value, propertyKey);
          };
        }

        return updated;
      },
  );
  const decorateWith = (
      { get, set }: ComponentProperty.Accessor<TValue, InstanceType<TClass>>,
      key: string | symbol = AnonymousComponentProperty__symbol,
      writable: boolean,
  ): ComponentDecorator<TClass> => Component({
    [ComponentDef__symbol](type: InstanceType<TClass>) {

      const def = define({
        type,
        key,
        readable: true,
        writable,
        enumerable: false,
        configurable: false,
        get: component => get(component, key),
        set: (component, value) => set(component, value, key),
      });

      return (def && def.componentDef) || {};
    },
  });
  const By = (
      provider: ComponentProperty.Provider<TValue, InstanceType<TClass>>,
      key?: string | symbol,
  ): ComponentDecorator<TClass> => decorateWith(
      {
        get(component, key) {
          return provider(component, key);
        },
      } as ComponentProperty.Accessor<TValue>,
      key,
      false,
  );

  const result = decorator as ComponentPropertyDecorator<TValue, TClass>;

  result.With = (access, key) => decorateWith(access, key, true);
  result.By = By;
  result.As = (value, key?) => By(valueProvider(value), key);
  result.Bind = (binder, key = AnonymousComponentProperty__symbol) => {

    const accessor__symbol = Symbol(`${String(key)}:accessor`);

    interface HostComponent {
      [accessor__symbol]?: {
        get(): TValue;
        set(value: TValue): void;
      };
    }

    const accessor = (component: HostComponent): {
      get(): TValue;
      set(value: TValue): void;
    } => {

      const existing = component[accessor__symbol];

      if (existing) {
        return existing;
      }

      const accessor = binder(component as InstanceType<TClass>, key);

      return component[accessor__symbol] = {
        get: accessor.get ? accessor.get.bind(accessor) : notReadableAccessor(key),
        set: accessor.set ? accessor.set.bind(accessor) : notWritableAccessor(key),
      };
    };

    return decorateWith(
        {
          get(component) {
            return accessor(component).get();
          },
          set(component, value) {
            return accessor(component).set(value);
          },
        },
        key,
        true,
    );
  };

  return result;
}

/**
 * @internal
 */
function notReadableAccessor(propertyKey: string | symbol): () => never {
  return () => { throw new TypeError(`"${String(propertyKey)}" is not readable`); };
}

/**
 * @internal
 */
function notWritableAccessor(propertyKey: string | symbol): () => never {
  return () => { throw new TypeError(`"${String(propertyKey)}" is not writable`); };
}
