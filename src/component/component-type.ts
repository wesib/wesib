import { Class } from '../types';
import { componentDesc, ComponentDesc, mergeComponentDescs } from './component-desc';

export interface ElementRef<HTE extends HTMLElement = HTMLElement> {
  readonly element: HTE;
}

export interface ComponentClass<T extends object = object, HTE extends HTMLElement = HTMLElement> extends Function {
  new (elementRef: ElementRef<HTE>): T;
  prototype: T;
}

export type ComponentElementType<T extends object> =
    T extends ComponentClass<T, infer HTE> ? HTE : HTMLElement;

export function descriptorOf<T extends object>(
    componentType: ComponentType<T>):
    ComponentDesc<ComponentElementType<T>> {

  const desc = componentType[componentDesc];

  if (!desc) {
    throw TypeError(`Not a web component: ${componentType.name}`);
  }

  return desc;
}

export interface ComponentType<T extends object = object, HTE extends HTMLElement = ComponentElementType<T>>
    extends ComponentClass<T, HTE> {
  readonly [componentDesc]?: ComponentDesc<HTE>;
}

export function describeComponent<T extends Class>(type: T, ...descs: Partial<ComponentDesc>[]): T {

  const componentType = type as ComponentType;
  const prevDesc = componentType[componentDesc];
  let desc: ComponentDesc;

  if (prevDesc) {
    desc = mergeComponentDescs(prevDesc, ...descs) as ComponentDesc;
  } else {
    desc = mergeComponentDescs(...descs) as ComponentDesc;
  }

  Object.defineProperty(
      type,
      componentDesc,
      {
        configurable: true,
        enumerable: true,
        value: desc,
      });

  return type;
}
