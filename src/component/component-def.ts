/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { isQualifiedName, QualifiedName } from '@frontmeans/namespace-aliaser';
import { mergeFunctions } from '@proc7ts/primitives';
import { MetaAccessor } from '../common';
import { FeatureDef, FeatureDef__symbol } from '../feature';
import { ComponentClass, DefinitionContext, DefinitionSetup, ElementDef } from './definition';

/**
 * A key of a property holding a component definition within its class constructor.
 *
 * @category Core
 */
export const ComponentDef__symbol = (/*#__PURE__*/ Symbol('component-def'));

/**
 * Component definition.
 *
 * A custom element class will be created for each registered component in accordance to this definition.
 *
 * This can be one of:
 * - custom element name (possibly qualified),
 * - component definition options,
 * - component definition holder,
 * - component definition factory,
 * - feature definition holder, or
 * - feature definition factory.
 *
 * @category Core
 * @typeParam T - A type of component.
 */
export type ComponentDef<T extends object = any> =
    | QualifiedName
    | ComponentDef.Options<T>
    | ComponentDef.Holder<T>
    | ComponentDef.Factory<T>
    | FeatureDef.Holder
    | FeatureDef.Factory;

/**
 * @category Core
 */
export namespace ComponentDef {

  /**
   * Component definition options.
   */
  export interface Options<T extends object = any> {

    readonly [ComponentDef__symbol]?: undefined;

    /**
     * Custom element name.
     *
     * The name may belong to some namespace to avoid naming conflicts. I.e. it can be either a string, or
     * name/namespace tuple.
     *
     * When omitted an anonymous component will be registered. Such component is not bound to custom element, but it
     * still can be mounted.
     */
    readonly name?: QualifiedName;

    /**
     * Existing element to extend by custom one.
     */
    readonly extend?: ElementDef.Extend;

    /**
     * Additional feature definition options.
     */
    readonly feature?: FeatureDef.Options;

    /**
     * Sets up component definition.
     *
     * This method is called before component definition context constructed.
     *
     * @param setup - Component definition setup.
     */
    setup?(setup: DefinitionSetup<T>): void;

    /**
     * Defines this component by calling the given component definition context methods.
     *
     * This function is called before the custom element is defined.
     *
     * @param defContext - Component definition context.
     */
    define?(defContext: DefinitionContext<T>): void;

  }

  /**
   * Component definition holder.
   *
   * @typeParam T - A type of component.
   */
  export interface Holder<T extends object = any> {

    /**
     * The component definition this holder contains.
     */
    readonly [ComponentDef__symbol]: ComponentDef<T>;

  }

  /**
   * Component definition factory.
   *
   * @typeParam T - A type of component.
   */
  export interface Factory<T extends object = any> {

    /**
     * Builds component definition.
     *
     * @param componentType - A component class constructor to build definition for.
     *
     * @returns Built component definition.
     */
    [ComponentDef__symbol](componentType: ComponentClass<T>): ComponentDef<T>;

  }

}

/**
 * @internal
 */
type ComponentDefHolder<T extends object> =
    | ComponentDef.Options<T>
    | ComponentDef.Holder<T>
    | ComponentDef.Factory<T>
    | { [ComponentDef__symbol]?: undefined };

/**
 * @internal
 */
type FeatureDefHolder =
    | FeatureDef.Holder
    | FeatureDef.Factory
    | { [FeatureDef__symbol]?: undefined };

/**
 * @internal
 */
class ComponentMeta extends MetaAccessor<ComponentDef.Options, ComponentDef> {

  constructor() {
    super(ComponentDef__symbol);
  }

  merge<T extends object>(defs: readonly ComponentDef.Options<T>[]): ComponentDef.Options<T> {
    return defs.reduce(
        (prev, def) => ({
          ...prev,
          ...def,
          setup: mergeFunctions(prev.setup, def.setup),
          define: mergeFunctions(prev.define, def.define),
          feature: prev.feature
              ? def.feature ? FeatureDef.merge(prev.feature, def.feature) : prev.feature
              : def.feature,
        }),
        {},
    );
  }

  meta<T extends object>(source: ComponentDef<T>, componentType: ComponentClass<T>): ComponentDef.Options<T> {

    const def = (source as ComponentDefHolder<T>)[ComponentDef__symbol];

    if (def != null) {
      return this.meta(
          typeof def === 'function' ? (source as ComponentDef.Factory<T>)[ComponentDef__symbol](componentType) : def,
          componentType,
      );
    }
    if ((source as FeatureDefHolder)[FeatureDef__symbol] != null) {
      return {
        feature: FeatureDef.for(componentType, source as FeatureDef),
      };
    }
    if (isQualifiedName(source)) {
      return { name: source };
    }

    return source as ComponentDef.Options<T>;
  }

}

/**
 * @internal
 */
const componentMeta = (/*#__PURE__*/ new ComponentMeta());

/**
 * @internal
 */
const noComponentDef: ComponentDef.Factory = {
  [ComponentDef__symbol]() {
    return {};
  },
};

/**
 * @category Core
 */
export const ComponentDef = {

  /**
   * Extracts component definition options from its type.
   *
   * @typeParam T - A type of component.
   * @param componentType - Target component class constructor.
   *
   * @returns Component definition options. May be empty if there is not definition attached to component type.
   */
  of<T extends object>(this: void, componentType: ComponentClass<T>): ComponentDef.Options<T> {
    return componentMeta.of(componentType) as ComponentDef.Options<T> || {};
  },

  /**
   * Builds component definition options for the given component class.
   *
   * @param componentType - Target component class constructor.
   * @param source - A source of component definition.
   *
   * @returns Component definition.
   */
  for<T extends object>(
      this: void,
      componentType: ComponentClass<T>,
      source: ComponentDef<T>,
  ): ComponentDef.Options<T> {
    return componentMeta.meta(source, componentType);
  },

  /**
   * Merges multiple component definition options.
   *
   * @typeParam T - A type of component.
   * @param defs - Component definition options to merge.
   *
   * @returns Merged component definition options.
   */
  merge<T extends object>(this: void, ...defs: ComponentDef.Options<T>[]): ComponentDef.Options<T> {
    return componentMeta.merge(defs);
  },

  /**
   * Merges multiple component definitions.
   *
   * @typeParam T - A type of component.
   * @param defs - Component definitions to merge.
   *
   * @returns Merged component definition.
   */
  all<T extends object>(this: void, ...defs: ComponentDef<T>[]): ComponentDef<T> {
    return defs.reduce<ComponentDef.Factory<T>>(
        (prev, def) => ({
          [ComponentDef__symbol](componentType: ComponentClass<T>) {
            return ComponentDef.merge(
                ComponentDef.for(componentType, prev),
                ComponentDef.for(componentType, def),
            );
          },
        }),
        noComponentDef,
    );
  },

  /**
   * Defines a component.
   *
   * Either assigns new or extends existing component definition and stores it under {@link ComponentDef__symbol} key.
   *
   * Each component can be passed directly to {@link bootstrapComponents} function or added as a requirement
   * of another feature.
   *
   * @typeParam T - A type of component.
   * @param componentType - Component class constructor.
   * @param defs - Component definitions.
   *
   * @returns The `type` instance.
   */
  define<T extends ComponentClass>(
      this: void,
      componentType: T,
      ...defs: ComponentDef<InstanceType<T>>[]
  ): T {
    return componentMeta.define(componentType, defs);
  },

};
