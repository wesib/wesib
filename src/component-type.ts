import { ComponentDesc, mergeComponentDescs } from './component-desc';

export const componentDesc = Symbol('web-component-descriptor');

export interface ElementRef<HTE extends HTMLElement = HTMLElement> {
  readonly element: HTE;
}

export interface ComponentConstructorType<T extends object = T, HTE extends HTMLElement = HTMLElement> {
  new(elementRef: ElementRef<HTE>): T;
}

export type ComponentElementType<T extends object> =
    T extends ComponentConstructorType<T, infer HTE> ? HTE : any;

export interface ComponentType<T extends object = T>
    extends ComponentConstructorType<T, ComponentElementType<T>> {
  readonly [componentDesc]?: ComponentDesc<ComponentElementType<T>>;
}

export function addComponentDesc(type: ComponentType, ...descs: Partial<ComponentDesc>[]): typeof type {

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
