import { ElementClass } from '../element';

export interface ExtendedElement<HTE extends HTMLElement> {
  type: ElementClass<HTE>;
  name: string;
}

export interface ComponentDesc<HTE extends HTMLElement = HTMLElement> {
  name: string;
  extend?: ExtendedElement<HTE>;
  properties?: PropertyDescriptorMap;
}

export function mergeComponentDescs<HTE extends HTMLElement = HTMLElement>(...descs: Partial<ComponentDesc<HTE>>[]):
    Partial<ComponentDesc> {
  return descs.reduce(
      (prev, desc) => {

        const result: Partial<ComponentDesc<HTE>> = {
          ...prev,
          ...desc,
        };

        if (prev.properties || desc.properties) {
          result.properties = {
            ...prev.properties,
            ...desc.properties,
          };
        }

        return result;
      },
      {});
}

export function componentElementType<HTE extends HTMLElement = HTMLElement>(
    desc: ComponentDesc<HTE>):
    ElementClass<HTE> {
  return desc.extend && desc.extend.type || (HTMLElement as ElementClass<HTE>);
}
