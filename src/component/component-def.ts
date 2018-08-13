import { ElementClass } from '../element';
import { ComponentElementType } from './component';

export const componentDef = Symbol('web-component-def');

export interface ComponentDef<T extends object = object, HTE extends HTMLElement = ComponentElementType<T>> {
  name: string;
  extend?: ExtendedElementDef<HTE>;
  properties?: PropertyDescriptorMap;
  attributes?: AttributeDefs<T>;
}

export interface ExtendedElementDef<HTE extends HTMLElement> {
  type: ElementClass<HTE>;
  name: string;
}

export interface AttributeDefs<T extends object = object> {
  [name: string]: AttributeDef<T>;
}

export type AttributeDef<T extends object = object> = (this: T, oldValue: string, newValue: string) => void;

export function mergeComponentDefs<
    T extends object = object,
    HTE extends HTMLElement = HTMLElement>(...defs: Partial<ComponentDef<T, HTE>>[]):
    Partial<ComponentDef<T, HTE>> {
  return defs.reduce(
      (prev, def) => {

        const result: Partial<ComponentDef<T, HTE>> = {
          ...prev,
          ...def,
        };

        if (prev.properties || def.properties) {
          result.properties = {
            ...prev.properties,
            ...def.properties,
          };
        }
        if (prev.attributes || def.attributes) {
          result.attributes = {
            ...prev.attributes,
            ...def.attributes,
          };
        }

        return result;
      },
      {});
}
