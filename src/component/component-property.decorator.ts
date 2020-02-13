/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { valueProvider } from 'call-thru';
import { Class, decoratePropertyAccessor, PropertyAccessorDescriptor } from '../common';
import { ComponentContext } from './component-context';
import { ComponentDef, ComponentDef__symbol } from './component-def';
import { Component, ComponentDecorator } from './component.decorator';
import { ComponentClass } from './definition';

/**
 * Component property decorator interface.
 *
 * Allows to construct a {@link ComponentDecorator component decorator} by declaring a virtual property to use instead
 * of decorated one.
 *
 * Constructed by [[ComponentProperty]] function.
 *
 * @category Core
 * @typeparam V  Property value type.
 * @typeparam T  A type of decorated component class.
 */
export interface ComponentPropertyDecorator<V, T extends ComponentClass = Class> {

  /**
   * Decorates component method.
   *
   * @param proto  Decorated class prototype.
   * @param propertyKey  Decorated property key.
   * @param descriptor  Decorated property descriptor.
   *
   * @returns  Either updated property descriptor, or nothing.
   */
  // eslint-disable-next-line
  (
      this: void,
      proto: InstanceType<T>,
      propertyKey: string | symbol,
      descriptor?: TypedPropertyDescriptor<V>,
  ): any | void;

  /**
   * Builds component decorator assuming the virtual property has the given value.
   *
   * @param value  Virtual property value.
   * @param key  Virtual property key. Defaults to [[AnonymousComponentProperty__symbol]].
   *
   * @returns New component decorator.
   */
  As(
      this: void,
      value: V,
      key?: string | symbol,
  ): ComponentDecorator<T>;

  /**
   * Builds component decorator assuming the virtual property value is provided by the given `provider`.
   *
   * @param provider  Virtual property read-only value provider.
   * @param key  Virtual property key. Defaults to [[AnonymousComponentProperty__symbol]].
   *
   * @returns New component decorator.
   */
  By(
      this: void,
      provider: ComponentProperty.Provider<V, InstanceType<T>>,
      key?: string | symbol,
  ): ComponentDecorator<T>;

  /**
   * Builds component decorator assuming the decorated property is available via the given `access` specifier.
   *
   * @param access  Virtual property read/write access specifier.
   * @param key  Virtual property key. Defaults to [[AnonymousComponentProperty__symbol]].
   *
   * @returns New component decorator.
   */
  With(
      this: void,
      access: ComponentProperty.Access<V, InstanceType<T>>,
      key?: string | symbol,
  ): ComponentDecorator<T>;

}

export namespace ComponentProperty {

  /**
   * Component property value provider signature.
   *
   * This function will be called each time the property value is requested.
   *
   * @typeparam V  Property value type.
   * @typeparam T  A type of component.
   */
  export type Provider<V, T extends object = any> =
  /**
   * @param component  Component instance.
   * @param key  Target property key.
   *
   * @returns Property value.
   */
      (
          this: void,
          component: T,
          key: string | symbol,
      ) => V;

  /**
   * Component property value access specifier signature.
   *
   * This function is called at most once per component instance to create an accessor. The created accessor is used
   * to access the property after that.
   *
   * @typeparam V  Property value type.
   * @typeparam T  A type of component.
   */
  export type Access<V, T extends object = any> =
  /**
   * @param component  Component instance.
   * @param key  Target property key.
   *
   * @returns Component property accessor.
   */
      (
          this: void,
          component: T,
          key: string | symbol,
      ) => Accessor<V>;

  /**
   * Component property accessor.
   *
   * Allows to read and write property value.
   *
   * Constructed by {@link Access property access specifier}.
   *
   * @typeparam V  Property value type.
   */
  export interface Accessor<V> {

    /**
     * Reads property value.
     *
     * May throw if the property is not readable.
     *
     * @returns Property value.
     */
    get(this: void): V;

    /**
     * Assigns new property value.
     *
     * May throw is the property is not writable.
     *
     * @param value  New property value.
     */
    set(this: void, value: V): void;

  }

  /**
   * Component property descriptor.
   *
   * Passed to {@link Definer property definer} by [[ComponentProperty]] function to construct a {@link Definition
   * property definition}.
   *
   * @typeparam V  Property value type.
   * @typeparam T  A type of component class.
   */
  export interface Descriptor<V, T extends ComponentClass = Class> {

    /**
     * Component class constructor.
     */
    readonly type: T;

    /**
     * Component property key.
     */
    readonly key: string | symbol;

    /**
     * Whether the property is writable.
     *
     * This can not be changed.
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
     * Creates property accessor for the given component.
     *
     * Does not require component key, unlike {@link Access access specifier}.
     *
     * This is a function, not a method. It does not require to be bound to descriptor instance.
     *
     * @param component  Component instance to create component of.
     */
    access(
        this: void,
        component: InstanceType<T>,
    ): Accessor<V>;

  }

  /**
   * Component property definition builder signature.
   *
   * This is a function called by [[ComponentProperty]] to define the property.
   *
   * @typeparam V  Property value type.
   * @typeparam T  A type of component class.
   */
  export type Definer<V, T extends ComponentClass = Class> =
  /**
   * @param descriptor  Component property descriptor.
   *
   * @returns Component property definition. Or nothing if the property definition is not to be changed.
   */
      (
          this: void,
          descriptor: Descriptor<V, T>,
      ) => Definition<V, T> | void;

  /**
   * Property definition to apply to existing property.
   *
   * When applying to decorated property, this definition updates its definition.
   *
   * When applying to virtual property assumed by one of [[ComponentPropertyDescriptor]] methods, most of returned
   * values ignored. Except for {@link Definition.componentDef component definition} and {@link Definition.access
   * access specifier}.
   *
   * @typeparam V  Property value type.
   * @typeparam T  A type of component class.
   */
  export interface Definition<V, T extends ComponentClass = Class> {

    /**
     * Component definition to apply to component.
     *
     * When specified, it is used to enable certain functionality for decorated (or virtual) property.
     */
    readonly componentDef?: ComponentDef<InstanceType<T>>;

    /**
     * Component value access specifier.
     *
     * When specified, it is used to change how property value is accessed. For decorated properties this changes
     * the property descriptor.
     */
    readonly access?: ComponentProperty.Access<V, InstanceType<T>>;

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
 * @typeparam V  Decorated property value type.
 * @typeparam T  A type of decorated component class.
 * @param define  Component property definition builder.
 *
 * @returns Component property decorator.
 */
export function ComponentProperty<V, T extends ComponentClass = Class>(
    define: ComponentProperty.Definer<V, T>,
): ComponentPropertyDecorator<V, T> {

  const decorator = (
      proto: InstanceType<T>,
      propertyKey: string | symbol,
      descriptor?: TypedPropertyDescriptor<V>,
  ): any | void => {

    const accessor__symbol = Symbol(`${String(propertyKey)}:accessor`);

    return decoratePropertyAccessor(
        proto,
        propertyKey,
        descriptor,
        desc => {

          const type = proto.constructor;
          const { access, configurable, enumerable, componentDef = {} } = define({
            type,
            key: propertyKey,
            writable: !!desc.set,
            enumerable: !!desc.enumerable,
            configurable: !!desc.configurable,
            access: componentPropertyAccess(propertyKey, desc),
          }) || {};

          ComponentDef.define(type, componentDef);

          const updated: PropertyAccessorDescriptor<V> = {
            ...desc,
            configurable: configurable ?? desc.configurable,
            enumerable: enumerable ?? desc.enumerable,
          };

          if (access) {

            const accessorOf = (component: InstanceType<T>): ComponentProperty.Accessor<V> => (
                component[accessor__symbol]
                || (component[accessor__symbol] = access(component, propertyKey))
            );

            updated.get = function (this: any) {
              return accessorOf(this).get();
            };
            if (desc.set) {
              updated.set = function (this: any, value: V) {
                accessorOf(this).set(value);
              };
            }
          }

          return updated;
        },
    );
  };
  const decorateWith = (
      access: ComponentProperty.Access<V, InstanceType<T>>,
      key: string | symbol = AnonymousComponentProperty__symbol,
      writable: boolean,
  ): ComponentDecorator<T> => Component({
    [ComponentDef__symbol](type: InstanceType<T>) {

      const def = define({
        type,
        key,
        writable,
        enumerable: false,
        configurable: false,
        access: context => access(context, key),
      });

      return (def && def.componentDef) || {};
    },
  });
  const By = (
      provider: ComponentProperty.Provider<V, InstanceType<T>>,
      key?: string | symbol,
  ): ComponentDecorator<T> => decorateWith(
      (component, key) => ({
        get() {
          return provider(component, key);
        },
      } as ComponentProperty.Accessor<V>),
      key,
      false,
  );

  const result = decorator as ComponentPropertyDecorator<V, T>;

  result.With = (access, key) => decorateWith(access, key, true);
  result.By = By;
  result.As = (value, key?) => By(valueProvider(value), key);

  return result;
}

/**
 * @internal
 */
function componentPropertyAccess<V, T extends object>(
    key: string | symbol,
    desc: PropertyAccessorDescriptor<V>,
): (
    this: void,
    context: ComponentContext<T>,
) => ComponentProperty.Accessor<V> {
  return component => ({
    get: desc.get ? desc.get.bind(component) : (() => { throw new TypeError(`"${String(key)}" is not readable`); }),
    set: desc.set && desc.set.bind(component),
  }) as ComponentProperty.Accessor<V>;
}
