/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { valueProvider } from 'call-thru';
import { Class, decoratePropertyAccessor, PropertyAccessorDescriptor } from '../common';
import { ComponentContext } from './component-context';
import { ComponentDef, ComponentDef__symbol } from './component-def';
import { ComponentClass } from './definition';

export interface ComponentPropertyDecorator<V, T extends ComponentClass = Class> {

  // eslint-disable-next-line
  (
      this: void,
      proto: InstanceType<T>,
      propertyKey: string | symbol,
      descriptor?: TypedPropertyDescriptor<V>,
  ): any | void;

  As(
      this: void,
      value: V,
      key?: string | symbol,
  ): ComponentDef<InstanceType<T>>;

  By(
      this: void,
      createValue: ComponentProperty.Factory<V, InstanceType<T>>,
      key?: string | symbol,
  ): ComponentDef<InstanceType<T>>;

  With(
      this: void,
      access: ComponentProperty.Access<V, InstanceType<T>>,
      key?: string | symbol,
  ): ComponentDef<InstanceType<T>>;

}

export namespace ComponentProperty {

  export type Factory<V, T extends object = any> =
      (
          this: void,
          context: ComponentContext<T>,
          key: string | symbol,
      ) => V;

  export type Access<V, T extends object = any> =
      (
          this: void,
          component: T,
          key: string | symbol,
      ) => Accessor<V>;

  export interface Accessor<V> {

    get(this: void): V;

    set(this: void, value: V): void;

  }

  export interface Descriptor<V, T extends ComponentClass = Class> {

    readonly type: T;

    readonly key: string | symbol;

    readonly access: (
        this: void,
        component: InstanceType<T>,
    ) => Accessor<V>;

    readonly writable: boolean;

    readonly enumerable: boolean;

    readonly configurable: boolean;

  }

  export type Definer<V, T extends ComponentClass = Class> =
      (
          this: void,
          descriptor: Descriptor<V, T>,
      ) => Definition<V, T> | void;

  export interface Definition<V, T extends ComponentClass = Class> {

    readonly componentDef?: ComponentDef<InstanceType<T>>;

    readonly access?: ComponentProperty.Access<V, InstanceType<T>>;

    readonly enumerable?: boolean;

    readonly configurable?: boolean;

  }

}

export const AnonymousComponentProperty__symbol = (/*#__PURE__*/ Symbol('anonymous-component-property'));

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

  const result = decorator as ComponentPropertyDecorator<V, T>;

  const decorateWith = (
      access: ComponentProperty.Access<V, InstanceType<T>>,
      key: string | symbol = AnonymousComponentProperty__symbol,
      writable: boolean,
  ): ComponentDef.Factory<InstanceType<T>> => ({
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
      createValue: ComponentProperty.Factory<V, InstanceType<T>>,
      key?: string | symbol,
  ): ComponentDef.Factory<InstanceType<T>> => decorateWith(
      (context, key) => {

        const value = createValue(context, key);

        return {
          get() {
            return value;
          },
        } as ComponentProperty.Accessor<V>;
      },
      key,
      false,
  );

  result.With = (access, key) => decorateWith(access, key, true);
  result.By = By;
  result.As = (value, key?) => By(valueProvider(value), key);

  return result;
}

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
