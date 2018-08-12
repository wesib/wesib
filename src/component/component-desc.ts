import { ElementClass } from '../element';

export const componentDesc = Symbol('web-component-descriptor');

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
