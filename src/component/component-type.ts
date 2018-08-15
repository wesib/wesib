import { Class } from '../types';
import { ComponentClass, ComponentElementType } from './component';
import { componentDef, ComponentDef, mergeComponentDefs } from './component-def';

/**
 * Web component type.
 *
 * This is a web component class constructor that may accept a custom HTML element reference as the only parameter.
 *
 * Web component type should contain a property with `componentDef` symbol as its key containing a web component
 * definition. This is the only requirement for the web component classes.
 *
 * @param <T> A type of web component.
 * @param <HTE> A type of HTML element this web component extends.
 */
export interface ComponentType<T extends object = object, HTE extends HTMLElement = ComponentElementType<T>>
    extends ComponentClass<T, HTE> {
  readonly [componentDef]?: ComponentDef<T, HTE>;
}

/**
 * Extracts a web component definition from its type.
 *
 * @param <T> A type of web component.
 * @param <HTE> A type of HTML element this web component extends.
 * @param componentType Target component type.
 *
 * @returns Web component definition.
 *
 * @throws TypeError if target `componentType` does not contain web component definition.
 */
export function definitionOf<T extends object, HTE extends HTMLElement>(
    componentType: ComponentType<T, HTE>):
    ComponentDef<T, HTE> {

  const def = componentType[componentDef];

  if (!def) {
    throw TypeError(`Not a web component type: ${componentType.name}`);
  }

  return def;
}

/**
 * Defines a web component.
 *
 * Either assigns new or extends an existing component definition and stores it under `componentDef` key.
 *
 * @param <T> A type of web component.
 * @param <HTE> A type of HTML element this web component extends.
 * @param type Web component class constructor.
 * @param defs Web component definitions.
 */
export function defineComponent<
    T extends Class,
    HTE extends HTMLElement>(type: T, ...defs: Partial<ComponentDef<InstanceType<T>, HTE>>[]): T {

  const componentType = type as ComponentType;
  const prevDef = componentType[componentDef];
  let def: ComponentDef;

  if (prevDef) {
    def = mergeComponentDefs(prevDef, ...defs) as ComponentDef;
  } else {
    def = mergeComponentDefs(...defs) as ComponentDef;
  }

  Object.defineProperty(
      type,
      componentDef,
      {
        configurable: true,
        value: def,
      });

  return type;
}
