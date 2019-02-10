import { ContextValueSpec } from 'context-values';
import { ArraySet, Class, mergeFunctions, MetaAccessor } from '../common';
import { FeatureDef } from '../feature';
import { ComponentClass } from './component-class';
import { ComponentContext } from './component-context';
import { DefinitionContext } from './definition';

/**
 * Component definition.
 *
 * A custom element class will be created for each registered component in accordance to this definition.
 *
 * @param <T> A type of component.
 */
export interface ComponentDef<T extends object = object> {

  /**
   * Custom element name.
   *
   * When omitted an anonymous component will be registered. Such component is not bound to custom element, but it
   * still can be mounted.
   */
  name?: string;

  /**
   * Existing element to extend by custom one.
   */
  extend?: ExtendedElementDef;

  /**
   * Definition context values to declare prior to component class definition.
   */
  set?: ContextValueSpec<DefinitionContext<T>, any, any[], any>
      | ContextValueSpec<DefinitionContext<T>, any, any[], any>[];

  /**
   * Defines this component by calling the given component definition context methods.
   *
   * This function is called before the custom element is defined.
   *
   * @param context Component definition context.
   */
  define?: (this: Class<T>, context: DefinitionContext<T>) => void;

  /**
   * Component context values to declare prior to component construction.
   */
  forComponents?: ContextValueSpec<ComponentContext<T>, any, any[], any>
      | ContextValueSpec<ComponentContext<T>, any, any[], any>[];

}

/**
 * The definition of element to extend by custom one.
 */
export interface ExtendedElementDef {

  /**
   * The class constructor of element to extend.
   */
  type: Class;

  /**
   * The name of element to extend.
   *
   * This is to support `as` attribute of standard HTML element. Note that this is not supported by polyfills.
   */
  name?: string;

}

export namespace ComponentDef {

  /**
   * A key of a property holding a component definition within its class constructor.
   */
  export const symbol = Symbol('component-def');

  class ComponentMeta extends MetaAccessor<ComponentDef<any>> {

    constructor() {
      super(ComponentDef.symbol);
    }

    merge<T extends object>(...defs: ComponentDef<T>[]): ComponentDef<T> {
      return defs.reduce(
          (prev, def) => {

            const merged: ComponentDef<T> = { ...prev, ...def };
            const set = new ArraySet(prev.set).merge(def.set);
            const newDefine = mergeFunctions(prev.define, def.define);
            const forComponents = new ArraySet(prev.forComponents).merge(def.forComponents);

            if (set.size) {
              merged.set = set.value;
            }
            if (newDefine) {
              merged.define = newDefine;
            }
            if (forComponents.size) {
              merged.forComponents = forComponents.value;
            }

            return merged;
          },
          {});
    }

  }

  const meta = new ComponentMeta();

  /**
   * Extracts a component definition from its type.
   *
   * @param <T> A type of component.
   * @param componentType Target component class constructor.
   *
   * @returns Component definition. May be empty if there is not definition attached to component type.
   */
  export function of<T extends object>(componentType: ComponentClass<T>): ComponentDef<T> {
    return meta.of(componentType) as ComponentDef<T> || {};
  }

  /**
   * Merges multiple (partial) component definitions.
   *
   * @param <T> A type of component.
   * @param defs Partial component definitions to merge.
   *
   * @returns Merged component definition.
   */
  export function merge<T extends object>(...defs: ComponentDef<T>[]): ComponentDef<T> {
    return meta.merge(...defs);
  }

  /**
   * Defines a component.
   *
   * Either assigns new or extends an existing component definition and stores it under `[ComponentDef.symbol]` key.
   *
   * Note that each `ComponentClass` is also a feature able to register itself, so it can be passed directly to
   * `bootstrapComponents()` function or added as a requirement of another feature.
   *
   * @param <T> A type of component.
   * @param type Component class constructor.
   * @param defs Component definitions.
   *
   * @returns The `type` instance.
   */
  export function define<T extends ComponentClass>(
      type: T,
      ...defs: ComponentDef<InstanceType<T>>[]): T {

    const prevDef = meta.of(type);

    meta.define(type, ...defs);

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
  }

}
