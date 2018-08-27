/**
 * Arbitrary class constructor.
 *
 * @param <T> A type of object.
 */
export interface Class<T extends object = object> extends Function {
  new(...args: any[]): T;
  prototype: T;
}

/**
 * Function argument types.
 *
 * @param <F> Function type.
 */
export type ArgumentTypes<F extends (...args: any[]) => any> = F extends (...args: infer A) => any ? A : never;
