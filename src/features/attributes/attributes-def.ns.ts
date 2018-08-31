import { mergeFunctions, MetaAccessor } from '../../common';
import { ComponentContext, ComponentType } from '../../component';
import { FeatureDef } from '../../feature';
import { AttributesDef } from './attributes-def';
import { AttributesSupport } from './attributes-support.feature';

declare module './attributes-def' {

  export namespace AttributesDef {

    /**
     * Extracts attributes definition from web component type.
     *
     * @param <T> A type of web component.
     * @param componentType Target component type.
     *
     * @returns Attributes definition. May be empty when there is no definition found in the given `componentType`.
     */
    export function of<T extends object>(componentType: ComponentType<T>): AttributesDef<T>;

    /**
     * Merges multiple attributes definitions.
     *
     * @param <T> A type of web component.
     * @param defs Attributes definitions to merge.
     *
     * @returns Merged attributes definition.
     */
    export function merge<T extends object = object>(...defs: AttributesDef<T>[]): AttributesDef<T>;

    /**
     * Defines a custom HTML element attributes.
     *
     * Either assigns new or extends an existing attributes definition and stores it under `AttributesDef.symbol` key.
     *
     * Automatically enables `AttributesSupport` feature.
     *
     * @param <T> A type of web component.
     * @param type Target web component type.
     * @param defs Attributes definitions to apply.
     *
     * @returns The `type` instance.
     */
    export function define<T extends ComponentType>(type: T, ...defs: AttributesDef<InstanceType<T>>[]): T;

  }

}

class AttributesMeta extends MetaAccessor<AttributesDef<any>> {

  constructor() {
    super(AttributesDef.symbol);
  }

  merge<T extends object = object>(...defs: AttributesDef<T>[]): AttributesDef<T> {
    return defs.reduce(
        (prev, def) => {

          const result: AttributesDef<T> = { ...prev };

          Object.keys(def).forEach(key => {
            result[key] = mergeFunctions<[string, string | null], void, T>(result[key], def[key]);
          });

          return result;
        },
        {});
  }

}

const meta = new AttributesMeta();

AttributesDef.of = <T extends object>(componentType: ComponentType<T>) => meta.of(componentType) || {};

AttributesDef.merge = <T extends object = object>(...defs: AttributesDef<T>[]) => meta.merge(...defs);

AttributesDef.define = <T extends ComponentType>(type: T, ...defs: AttributesDef<InstanceType<T>>[]) => {
  FeatureDef.define(type, { requires: [AttributesSupport] });
  return meta.define(type, ...defs);
};
