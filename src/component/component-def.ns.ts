import { MetaAccessor, superClassOf } from '../common';
import { FeatureDef } from '../feature';
import { ComponentClass } from './component';
import { ComponentDef, PartialComponentDef } from './component-def';

declare module './component-def' {

  export namespace ComponentDef {

    /**
     * Extracts a component definition from its type.
     *
     * @param <T> A type of component.
     * @param componentType Target component class constructor.
     *
     * @returns Component definition.
     *
     * @throws TypeError If target `componentType` does not contain a component definition.
     */
    export function of<T extends object>(componentType: ComponentClass<T>): ComponentDef<T>;

    /**
     * Merges multiple (partial) component definitions.
     *
     * @param <T> A type of component.
     * @param defs Partial component definitions to merge.
     *
     * @returns Merged component definition.
     */
    export function merge<T extends object>(...defs: PartialComponentDef<T>[]): PartialComponentDef<T>;

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
        ...defs: PartialComponentDef<InstanceType<T>>[]): T;

  }

}

class ComponentMeta extends MetaAccessor<PartialComponentDef<any>> {

  constructor() {
    super(ComponentDef.symbol);
  }

  merge<T extends object>(...defs: PartialComponentDef<T>[]): PartialComponentDef<T> {
    return Object.assign({}, ...defs);
  }

}

const meta = new ComponentMeta();

ComponentDef.of = function of<T extends object>(
    componentType: ComponentClass<T>):
    ComponentDef<T> {

  const def = meta.of(componentType) as ComponentDef<T>;
  const superType = superClassOf(componentType, st => ComponentDef.symbol in st);
  const superDef = superType && ComponentDef.of(superType);

  if (!def) {
    throw TypeError(`Not a component type: ${componentType.name}`);
  }

  return superDef && superDef !== def ? ComponentDef.merge(superDef, def) as ComponentDef<T> : def;
};

ComponentDef.merge = <T extends object>(...defs: PartialComponentDef<T>[]) => meta.merge(...defs);

ComponentDef.define = <T extends ComponentClass>(type: T, ...defs: PartialComponentDef<InstanceType<T>>[]) => {

  const prevDef = meta.of(type);

  meta.define(type, ...defs);

  if (prevDef) {
    return type; // Define component only once.
  }

  return FeatureDef.define(
      type,
      {
        bootstrap: function (context) {
          context.define(this);
        },
      });
};
