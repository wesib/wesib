import { ElementClass } from '../element';

export interface ComponentDesc<HTE extends HTMLElement = HTMLElement> {
  name: string;
  elementType?: ElementClass<HTE>;
  properties?: PropertyDescriptorMap;
}

export function mergeComponentDescs(...descs: Partial<ComponentDesc>[]): Partial<ComponentDesc> {
  return descs.reduce(
      (prev, desc) => ({
        ...prev,
        ...desc,
      }),
      {});
}

export function componentElementType<HTE extends HTMLElement = HTMLElement>(
    desc: ComponentDesc<HTE>):
    ElementClass<HTE> {
  return desc.elementType || (HTMLElement as ElementClass<HTE>);
}
