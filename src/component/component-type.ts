import { Class } from '../types';
import { ComponentClass, ComponentElementType } from './component';
import { componentDef, ComponentDef, mergeComponentDefs } from './component-def';

export interface ComponentType<T extends object = object, HTE extends HTMLElement = ComponentElementType<T>>
    extends ComponentClass<T, HTE> {
  readonly [componentDef]?: ComponentDef<T, HTE>;
}

export function definitionOf<T extends object, HTE extends HTMLElement>(
    componentType: ComponentType<T, HTE>):
    ComponentDef<T, HTE> {

  const def = componentType[componentDef];

  if (!def) {
    throw TypeError(`Not a web component: ${componentType.name}`);
  }

  return def;
}

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
        enumerable: true,
        value: def,
      });

  return type;
}
