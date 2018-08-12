import { ElementClass } from '../element';

export const componentDef = Symbol('web-component-def');

export interface ExtendedElement<HTE extends HTMLElement> {
  type: ElementClass<HTE>;
  name: string;
}

export interface ComponentDef<HTE extends HTMLElement = HTMLElement> {
  name: string;
  extend?: ExtendedElement<HTE>;
  properties?: PropertyDescriptorMap;
}

export function mergeComponentDefs<HTE extends HTMLElement = HTMLElement>(...defs: Partial<ComponentDef<HTE>>[]):
    Partial<ComponentDef> {
  return defs.reduce(
      (prev, def) => {

        const result: Partial<ComponentDef<HTE>> = {
          ...prev,
          ...def,
        };

        if (prev.properties || def.properties) {
          result.properties = {
            ...prev.properties,
            ...def.properties,
          };
        }

        return result;
      },
      {});
}
