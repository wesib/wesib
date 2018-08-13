import { ComponentDef, defineComponent } from '../component';
import { Class } from '../types';
import { ComponentDecorator } from './component-decorators';

export function WebComponent<
    T extends Class = Class<any>,
    HTE extends HTMLElement = HTMLElement>(def: ComponentDef<InstanceType<T>, HTE>): ComponentDecorator<T> {
  return (type: T) => defineComponent(type, def);
}
