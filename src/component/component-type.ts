import { Class } from '../types';
import { ComponentClass, ComponentElementType } from './component-class';
import { ComponentDef } from './component-def';

/**
 * Web component type.
 *
 * This is a web component class constructor that may accept a component context instance as the only parameter.
 *
 * Web component type should contain a property with `ComponentDef.symbol` symbol as its key containing a web component
 * definition. This is the only requirement for the web component classes.
 *
 * @param <T> A type of web component.
 * @param <E> A type of HTML element this web component extends.
 */
export interface ComponentType<T extends object = object, E extends HTMLElement = ComponentElementType<T>>
    extends ComponentClass<T, E> {
  readonly [ComponentDef.symbol]?: ComponentDef<T, E>;
}

declare module './component-def' {

  export namespace ComponentDef {

    /**
     * Extracts a web component definition from its type.
     *
     * @param <T> A type of web component.
     * @param <E> A type of HTML element this web component extends.
     * @param componentType Target component type.
     *
     * @returns Web component definition.
     *
     * @throws TypeError if target `componentType` does not contain web component definition.
     */
    export function of<T extends object, E extends HTMLElement>(
        componentType: ComponentType<T, E>):
        ComponentDef<T, E>;

  }

}

ComponentDef.of = function of<T extends object, E extends HTMLElement>(
    componentType: ComponentType<T, E>):
    ComponentDef<T, E> {

  const def = componentType[ComponentDef.symbol];

  if (!def) {
    throw TypeError(`Not a web component type: ${componentType.name}`);
  }

  return def;
};

/**
 * Defines a web component.
 *
 * Either assigns new or extends an existing component definition and stores it under `ComponentDef.symbol` key.
 *
 * @param <T> A type of web component.
 * @param <E> A type of HTML element this web component extends.
 * @param type Web component class constructor.
 * @param defs Web component definitions.
 */
export function defineComponent<
    T extends Class,
    E extends HTMLElement>(type: T, ...defs: Partial<ComponentDef<InstanceType<T>, E>>[]): T {

  const componentType = type as ComponentType;
  const prevDef = componentType[ComponentDef.symbol];
  let def: ComponentDef;

  if (prevDef) {
    def = ComponentDef.merge(prevDef, ...defs) as ComponentDef;
  } else {
    def = ComponentDef.merge(...defs) as ComponentDef;
  }

  Object.defineProperty(
      type,
      ComponentDef.symbol,
      {
        configurable: true,
        value: def,
      });

  return type;
}
