export interface ElementRef<HTE extends HTMLElement = HTMLElement> {
  readonly element: HTE;
}

export interface ComponentClass<T extends object = object, HTE extends HTMLElement = HTMLElement> extends Function {
  new (elementRef: ElementRef<HTE>): T;
  prototype: T;
}

export type ComponentElementType<T extends object> =
    T extends ComponentClass<T, infer HTE> ? HTE : HTMLElement;

export const componentRef = Symbol('web-component-ref');

export function componentOf<T extends object>(element: HTMLElement): T | undefined {
  return (element as any)[componentRef];
}
