import { defineComponent, ComponentDef } from '../component';
import { Class } from '../types';

export type WebComponentDecorator<T extends Class, I extends InstanceType<T> = InstanceType<T>> =
    (type: T) => T;

export function WebComponent<
    T extends Class,
    HTE extends HTMLElement>(def: ComponentDef<InstanceType<T>, HTE>): WebComponentDecorator<T> {
  return (type: T) => defineComponent(type, def);
}
