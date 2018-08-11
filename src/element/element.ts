export interface ElementClass<T extends HTMLElement = HTMLElement> extends Function {
  new(): T;
  prototype: T;
}
