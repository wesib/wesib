import { describeComponent, ComponentDesc } from '../component';
import { Class } from '../types';

export type WebComponentDecorator<T extends Class, I extends InstanceType<T> = InstanceType<T>> =
    (type: T) => T;

export function WebComponent<
    T extends Class,
    HTE extends HTMLElement>(desc: ComponentDesc<HTE>): WebComponentDecorator<T> {
  return (type: T) => describeComponent(type, desc);
}
