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
          context: ComponentContext<T>,
          key: string | symbol,
      ) => Accessor<V>;

  export interface Accessor<V> {

    get(): V;

    set(value: V): void;

  }

  export interface Descriptor<V, T extends ComponentClass = Class> {

    readonly type: T;

    readonly key: string | symbol;

    readonly access: (
        this: void,
        context: ComponentContext<InstanceType<T>>,
    ) => Accessor<V>;

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
            enumerable: descriptor ? !!descriptor.enumerable : true,
            configurable: descriptor ? !!descriptor.configurable : true,
            access: componentPropertyAccess(propertyKey, desc),
          }) || {};

          ComponentDef.define(type, componentDef);

          const updated: PropertyAccessorDescriptor<V> = {
            ...desc,
            configurable: configurable ?? desc.configurable,
            enumerable: enumerable ?? desc.enumerable,
          };

          if (access) {

            const accessorOf = (component: any): ComponentProperty.Accessor<V> => (
                component[accessor__symbol]
                || (component[accessor__symbol] = access(ComponentContext.of(component), propertyKey)));

            updated.get = function (this: any) {
              return accessorOf(this).get();
            };
            updated.set = function (this: any, value: V) {
              accessorOf(this).set(value);
            };
          }

          return updated;
        },
    );
  };

  const result = decorator as ComponentPropertyDecorator<V, T>;

  const With = (
      access: ComponentProperty.Access<V, InstanceType<T>>,
      key: string | symbol = AnonymousComponentProperty__symbol,
  ): ComponentDef.Factory<InstanceType<T>> => ({
    [ComponentDef__symbol](type: InstanceType<T>) {

      const def = define({
        type,
        key,
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
  ): ComponentDef.Factory<InstanceType<T>> => With(
      (context, key) => {

        const value = createValue(context, key);

        return {
          get() {
            return value;
          },
          set() {
            throw new TypeError(`"${String(key)}" is read-only`);
          },
        };
      },
      key,
  );

  result.With = With;
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
  return () => ({
    get: desc.get || (() => { throw new TypeError(`"${String(key)}" is not readable`); }),
    set: desc.set || (() => { throw new TypeError(`"${String(key)}" is read-only`); }),
  });
}
