import { ComponentDesc } from '../component-desc';
import { addComponentDesc, ComponentType } from '../component-type';

export type WebComponentDecorator = (type: ComponentType) => void;

export function WebComponent<HTE extends HTMLElement>(desc: ComponentDesc<HTE>): WebComponentDecorator {
  return type => {
    addComponentDesc(type, desc);
  };
}
