import { addComponentDesc, ComponentDesc, ComponentType } from '../component-type';

export type WebComponentDecorator<T extends object> = (type: ComponentType<T>) => typeof type;

export function WebComponent<T extends object>(desc: ComponentDesc): WebComponentDecorator<T> {
  return type => addComponentDesc(type, desc);
}
