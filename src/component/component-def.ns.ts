import { MetaAccessor, superClassOf } from '../common';
import { FeatureDef } from '../feature';
import { ComponentDef, PartialComponentDef } from './component-def';
import { ComponentType } from './component-type';

declare module './component-def' {

  export namespace ComponentDef {

    /**
     * Extracts a web component definition from its type.
     *
     * @param <T> A type of web component.
     * @param componentType Target component type.
     *
     * @returns Web component definition.
     *
     * @throws TypeError if target `componentType` does not contain web component definition.
     */
    export function of<T extends object>(componentType: ComponentType<T>): ComponentDef<T>;

    /**
     * Merges multiple web component (partial) definitions.
     *
     * @param <T> A type of web component.
     * @param defs Partial web component definitions to merge.
     *
     * @returns Merged component definition.
     */
    export function merge<T extends object>(...defs: PartialComponentDef<T>[]): PartialComponentDef<T>;

    /**
     * Defines a web component.
     *
     * Either assigns new or extends an existing component definition and stores it under `[ComponentDef.symbol]` key.
     *
     * Note that each ComponentType is also a web components feature able to register itself, so it can be passed
     * directly to `bootstrapComponents()` function or added as a requirement of other web components feature.
     *
     * @param <T> A type of web component.
     * @param type Web component class constructor.
     * @param defs Web component definitions.
     *
     * @returns The `type` instance.
     */
    export function define<T extends ComponentType>(
        type: T,
        ...defs: PartialComponentDef<InstanceType<T>>[]): T;

  }

}

class ComponentMeta extends MetaAccessor<PartialComponentDef<any, any>> {

  constructor() {
    super(ComponentDef.symbol);
  }

  merge<T extends object>(...defs: PartialComponentDef<T>[]): PartialComponentDef<T> {
    return Object.assign({}, ...defs);
  }

}

const meta = new ComponentMeta();

ComponentDef.of = function of<T extends object, E extends HTMLElement>(
    componentType: ComponentType<T, E>):
    ComponentDef<T, E> {

  const def = meta.of(componentType) as ComponentDef<T, E>;
  const superType = superClassOf(componentType, st => ComponentDef.symbol in st) as ComponentType<any, any>;
  const superDef = superType && ComponentDef.of(superType);

  if (!def) {
    throw TypeError(`Not a web component type: ${componentType.name}`);
  }

  return superDef && superDef !== def ? ComponentDef.merge(superDef, def) as ComponentDef<T, E> : def;
};

ComponentDef.merge = <T extends object>(...defs: PartialComponentDef<T>[]) => meta.merge(...defs);

ComponentDef.define = <T extends ComponentType>(type: T, ...defs: PartialComponentDef<InstanceType<T>>[]) => {

  const prevDef = meta.of(type);

  meta.define(type, ...defs);

  if (prevDef) {
    return type; // Define component only once.
  }

  return FeatureDef.define(
      type,
      {
        configure: function (context) {
          context.define(this);
        },
      });
};
