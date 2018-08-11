export interface Class<T extends object = object> extends Function {
  new(...args: any[]): T;
  prototype: T;
}
