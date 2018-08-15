/**
 * Arbitrary class constructor.
 *
 * @param <T> A type of object.
 */
export interface Class<T extends object = object> extends Function {
  new(...args: any[]): T;
  prototype: T;
}
