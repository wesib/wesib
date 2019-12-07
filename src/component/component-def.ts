/**
 * @module @wesib/wesib
 */
import { QualifiedName } from 'namespace-aliaser';
import { Class, mergeFunctions, MetaAccessor } from '../common';
import { FeatureDef } from '../feature';
import { ComponentClass, DefinitionContext, DefinitionSetup, ElementDef } from './definition';

/**
 * A key of a property holding a component definition within its class constructor.
 *
 * @category Core
 */
export const ComponentDef__symbol = /*#__PURE__*/ Symbol('component-def');

/**
 * Component definition.
 *
 * A custom element class will be created for each registered component in accordance to this definition.
 *
 * @category Core
 * @typeparam T  A type of component.
 */
export interface ComponentDef<T extends object = any> {

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
  readonly feature?: FeatureDef;

  /**
   * Sets up component definition.
   *
   * This method is called before component definition context constructed.
   *
   * @param setup  Component definition setup.
   */
  setup?(this: void, setup: DefinitionSetup<T>): void;

  /**
   * Defines this component by calling the given component definition context methods.
   *
   * This function is called before the custom element is defined.
   *
   * @param this  Component class.
   * @param context  Component definition context.
   */
  define?(this: Class<T>, context: DefinitionContext<T>): void;

}

class ComponentMeta extends MetaAccessor<ComponentDef> {

  constructor() {
    super(ComponentDef__symbol);
  }

  merge<T extends object>(...defs: ComponentDef<T>[]): ComponentDef<T> {
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
        {});
  }

}

const meta = /*#__PURE__*/ new ComponentMeta();

/**
 * @category Core
 */
export const ComponentDef = {

  /**
   * Extracts a component definition from its type.
   *
   * @typeparam T  A type of component.
   * @param componentType  Target component class constructor.
   *
   * @returns Component definition. May be empty if there is not definition attached to component type.
   */
  of<T extends object>(componentType: ComponentClass<T>): ComponentDef<T> {
    return meta.of(componentType) as ComponentDef<T> || {};
  },

  /**
   * Merges multiple (partial) component definitions.
   *
   * @typeparam T  A type of component.
   * @param defs  Partial component definitions to merge.
   *
   * @returns Merged component definition.
   */
  merge<T extends object>(...defs: ComponentDef<T>[]): ComponentDef<T> {
    return meta.merge(...defs);
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
   * @param type  Component class constructor.
   * @param defs  Component definitions.
   *
   * @returns The `type` instance.
   */
  define<T extends ComponentClass>(
      type: T,
      ...defs: ComponentDef<InstanceType<T>>[]
  ): T {

    const def = this.merge(...defs);
    const prevDef = meta.of(type);

    meta.define(type, def);

    const { feature } = def;

    if (feature) {
      FeatureDef.define(type, feature);
    }
    if (prevDef) {
      return type; // Define component only once.
    }

    return FeatureDef.define(
        type,
        {
          init: function (context) {
            context.define(this);
          },
        });
  },

};
