import { isQualifiedName, QualifiedName } from '@frontmeans/namespace-aliaser';
import { amend } from '@proc7ts/amend';
import { mergeFunctions } from '@proc7ts/primitives';
import { FeatureDef } from '../feature';
import { MetaAccessor } from '../impl/util';
import { ComponentClass, DefinitionContext, DefinitionSetup, ElementDef } from './definition';

/**
 * A key of a property holding a component definition within its class constructor.
 *
 * @category Core
 */
export const ComponentDef__symbol = (/*#__PURE__*/ Symbol('ComponentDef'));

/**
 * Component definition.
 *
 * A custom element class will be created for each registered component in accordance to this definition.
 *
 * @category Core
 * @typeParam T - A type of component.
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
  readonly name?: QualifiedName | undefined;

  /**
   * Existing element to extend by custom one.
   */
  readonly extend?: ElementDef.Extend | undefined;

  /**
   * Additional feature definition options.
   */
  readonly feature?: FeatureDef | undefined;

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
 * @internal
 */
class ComponentMeta extends MetaAccessor<ComponentDef, ComponentDef | QualifiedName> {

  constructor() {
    super(ComponentDef__symbol);
  }

  merge<T extends object>(defs: readonly (ComponentDef<T> | QualifiedName)[]): ComponentDef<T> {
    return defs.reduce<ComponentDef>(
        (prev, meta) => {

          const def = this.meta(meta);

          return ({
            ...prev,
            ...def,
            setup: mergeFunctions(prev.setup, def.setup),
            define: mergeFunctions(prev.define, def.define),
            feature: prev.feature
                ? def.feature ? FeatureDef.merge(prev.feature, def.feature) : prev.feature
                : def.feature,
          });
        },
        {},
    );
  }

  meta<T extends object>(source: ComponentDef<T> | QualifiedName): ComponentDef<T> {
    if (isQualifiedName(source)) {
      return { name: source };
    }

    return source;
  }

}

/**
 * @internal
 */
const componentMeta = (/*#__PURE__*/ new ComponentMeta());

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
  of<T extends object>(this: void, componentType: ComponentClass<T>): ComponentDef<T> {
    return componentMeta.of(amend(componentType)) || {};
  },

  /**
   * Merges multiple component definition options.
   *
   * @typeParam T - A type of component.
   * @param defs - Component definition options to merge.
   *
   * @returns Merged component definition options.
   */
  merge<T extends object>(this: void, ...defs: (ComponentDef<T> | QualifiedName)[]): ComponentDef<T> {
    return componentMeta.merge(defs);
  },

  /**
   * Defines a component.
   *
   * Either assigns new or extends existing component definition and stores it under {@link ComponentDef__symbol} key.
   *
   * Each component can be passed directly to {@link bootstrapComponents} function or added as a requirement
   * of another feature.
   *
   * @typeParam TClass - A type of component class.
   * @param componentType - Component class constructor.
   * @param defs - Component definitions.
   *
   * @returns The `type` instance.
   */
  define<TClass extends ComponentClass>(
      this: void,
      componentType: TClass,
      ...defs: (ComponentDef<InstanceType<TClass>> | QualifiedName)[]
  ): TClass {
    return componentMeta.define(componentType, defs);
  },

};
