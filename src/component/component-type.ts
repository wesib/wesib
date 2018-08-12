import { Class } from '../types';
import { componentDef, ComponentDef, mergeComponentDefs } from './component-def';

export interface ElementRef<HTE extends HTMLElement = HTMLElement> {
  readonly element: HTE;
}

export interface ComponentClass<T extends object = object, HTE extends HTMLElement = HTMLElement> extends Function {
  new (elementRef: ElementRef<HTE>): T;
  prototype: T;
}

export type ComponentElementType<T extends object> =
    T extends ComponentClass<T, infer HTE> ? HTE : HTMLElement;

export function definitionOf<T extends object>(
    componentType: ComponentType<T>):
    ComponentDef<ComponentElementType<T>> {

  const def = componentType[componentDef];

  if (!def) {
    throw TypeError(`Not a web component: ${componentType.name}`);
  }

  return def;
}

export interface ComponentType<T extends object = object, HTE extends HTMLElement = ComponentElementType<T>>
    extends ComponentClass<T, HTE> {
  readonly [componentDef]?: ComponentDef<HTE>;
}

export function defineComponent<T extends Class>(type: T, ...defs: Partial<ComponentDef>[]): T {

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
