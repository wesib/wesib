/**
 * @module @wesib/wesib
 */
import { itsReduction, mapIt } from 'a-iterable';
import { isQualifiedName, QualifiedName } from 'namespace-aliaser';
import { Class, mergeFunctions, MetaAccessor } from '../common';
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
 * @typeparam T  A type of component.
 */
export type ComponentDef<T extends object = any> =
    | QualifiedName
    | ComponentDef.Options<T>
    | ComponentDef.Holder<T>
    | ComponentDef.Factory<T>
    | FeatureDef.Holder
    | FeatureDef.Factory;

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
     * @param setup  Component definition setup.
     */
    setup?(setup: DefinitionSetup<T>): void;

    /**
     * Defines this component by calling the given component definition context methods.
     *
     * This function is called before the custom element is defined.
     *
     * @param context  Component definition context.
     */
    define?(context: DefinitionContext<T>): void;

  }

  /**
   * Component definition holder.
   *
   * @typeparam T  A type of component.
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
   * @typeparam T  A type of component.
   */
  export interface Factory<T extends object = any> {

    /**
     * Builds component definition.
     *
     * @param componentType  A component class constructor to build definition for.
     *
     * @returns Built component definition.
     */
    [ComponentDef__symbol](componentType: ComponentClass<T>): ComponentDef<T>;

  }

}

class ComponentMeta extends MetaAccessor<ComponentDef.Options, ComponentDef> {

  constructor() {
    super(ComponentDef__symbol);
  }

  merge<T extends object>(defs: Iterable<ComponentDef.Options<T>>): ComponentDef.Options<T> {
    return itsReduction<ComponentDef.Options<T>, ComponentDef.Options<T>>(
        defs,
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

    const def = (source as any)[ComponentDef__symbol];

    if (def != null) {
      return this.meta(
          typeof def === 'function' ? (source as ComponentDef.Factory<T>)[ComponentDef__symbol](componentType) : def,
          componentType,
      );
    }
    if ((source as any)[FeatureDef__symbol] != null) {
      return {
        feature: FeatureDef.for(componentType, source as FeatureDef),
      };
    }
    if (isQualifiedName(source)) {
      return { name: source };
    }

    return source as ComponentDef.Options;
  }

}

const meta = (/*#__PURE__*/ new ComponentMeta());
const componentDefined = (/*#__PURE__*/ Symbol('component-defined'));
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
   * @typeparam T  A type of component.
   * @param componentType  Target component class constructor.
   *
   * @returns Component definition options. May be empty if there is not definition attached to component type.
   */
  of<T extends object>(this: void, componentType: ComponentClass<T>): ComponentDef.Options<T> {
    return meta.of(componentType) as ComponentDef.Options<T> || {};
  },

  /**
   * Builds component definition options for the given component class.
   *
   * @param componentType  Target component class constructor.
   * @param source  A source of component definition.
   *
   * @returns Component definition.
   */
  for<T extends object>(
      this: void,
      componentType: ComponentClass<T>,
      source: ComponentDef<T>,
  ): ComponentDef.Options<T> {
    return meta.meta(source, componentType);
  },

  /**
   * Merges multiple component definition options.
   *
   * @typeparam T  A type of component.
   * @param defs  Component definition options to merge.
   *
   * @returns Merged component definition options.
   */
  merge<T extends object>(this: void, ...defs: ComponentDef.Options<T>[]): ComponentDef.Options<T> {
    return meta.merge(defs);
  },

  /**
   * Merges multiple component definitions.
   *
   * @typeparam T  A type of component.
   * @param defs  Component definitions to merge.
   *
   * @returns Merged component definition.
   */
  all<T extends object>(this: void, ...defs: ComponentDef<T>[]): ComponentDef<T> {
    return itsReduction<ComponentDef<T>, ComponentDef.Factory<T>>(
        defs,
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
   * Either assigns new or extends an existing component definition and stores it under [[ComponentDef__symbol]] key.
   *
   * Note that each component is also a feature able to register itself, so it can be passed directly to
   * [[bootstrapComponents]] function or added as a requirement of another feature.
   *
   * @typeparam T  A type of component.
   * @param componentType  Component class constructor.
   * @param defs  Component definitions.
   *
   * @returns The `type` instance.
   */
  define<T extends ComponentClass>(
      this: void,
      componentType: T,
      ...defs: ComponentDef<InstanceType<T>>[]
  ): T {

    const def = meta.merge(mapIt(defs, source => ComponentDef.for(componentType, source)));

    meta.define(componentType, [def]);
    FeatureDef.define(componentType, ComponentDef.featureDef(def));

    return componentType;
  },

  /**
   * Builds feature definition for the given component definition.
   *
   * @param def  Component definition options.
   *
   * @returns Feature definition that defines the component and applies other definitions from
   * [[ComponentDef.Options.feature]] property.
   */
  featureDef<T extends object>(this: void, def: ComponentDef.Options<T>): FeatureDef {
    return {
      [FeatureDef__symbol](featureType: Class) {

        const registrar: FeatureDef = {
          init(context) {
            if (context.feature === featureType && !featureType.hasOwnProperty(componentDefined)) {
              Object.defineProperty(featureType, componentDefined, { value: 1 });
              context.define(featureType);
            }
          },
        };
        const { feature } = def;

        return feature ? FeatureDef.merge(feature, registrar) : registrar;
      },
    };
  },

};
