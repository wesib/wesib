import { ContextValueSpec } from 'context-values';
import { ArraySet, Class, mergeFunctions, MetaAccessor } from '../common';
import { FeatureDef } from '../feature';
import { ComponentClass } from './component-class';
import { ComponentContext } from './component-context';
import { DefinitionContext } from './definition';
import { ElementDef } from './definition/element-def';

/**
 * A key of a property holding a component definition within its class constructor.
 */
export const componentDefSymbol = /*#__PURE__*/ Symbol('component-def');

class ComponentMeta extends MetaAccessor<ComponentDef<any>> {

  constructor() {
    super(componentDefSymbol);
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

const meta = /*#__PURE__*/ new ComponentMeta();

/**
 * Component definition.
 *
 * A custom element class will be created for each registered component in accordance to this definition.
 *
 * @param <T> A type of component.
 */
export abstract class ComponentDef<T extends object = object> {

  /**
   * Custom element name.
   *
   * When omitted an anonymous component will be registered. Such component is not bound to custom element, but it
   * still can be mounted.
   */
  abstract name?: string;

  /**
   * Existing element to extend by custom one.
   */
  abstract extend?: ElementDef.Extend;

  /**
   * Definition context values to declare prior to component class definition.
   */
  abstract set?: ContextValueSpec<DefinitionContext<T>, any, any[], any>
      | ContextValueSpec<DefinitionContext<T>, any, any[], any>[];

  /**
   * Defines this component by calling the given component definition context methods.
   *
   * This function is called before the custom element is defined.
   *
   * @param context Component definition context.
   */
  abstract define?: (this: Class<T>, context: DefinitionContext<T>) => void;

  /**
   * Component context values to declare prior to component construction.
   */
  abstract forComponents?: ContextValueSpec<ComponentContext<T>, any, any[], any>
      | ContextValueSpec<ComponentContext<T>, any, any[], any>[];

  /**
   * Extracts a component definition from its type.
   *
   * @param <T> A type of component.
   * @param componentType Target component class constructor.
   *
   * @returns Component definition. May be empty if there is not definition attached to component type.
   */
  static of<T extends object>(componentType: ComponentClass<T>): ComponentDef<T> {
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
  static merge<T extends object>(...defs: ComponentDef<T>[]): ComponentDef<T> {
    return meta.merge(...defs);
  }

  /**
   * Defines a component.
   *
   * Either assigns new or extends an existing component definition and stores it under `[componentDefSymbol]` key.
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
  static define<T extends ComponentClass>(
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
