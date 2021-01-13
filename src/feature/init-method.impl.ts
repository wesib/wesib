/**
 * @internal
 */
export type InitMethod<TTarget, TArgs extends any[]> =
    (this: TTarget, ...args: TArgs) => void | PromiseLike<unknown>;

/**
 * @internal
 */
export function mergeInitMethods<TTarget, TArgs extends any[]>(
    target1: TTarget,
    method1: InitMethod<TTarget, TArgs> | undefined,
    target2: TTarget,
    method2: InitMethod<TTarget, TArgs> | undefined,
): InitMethod<void, TArgs> | undefined {

  const m1 = method1 && (method1 as () => void | PromiseLike<undefined>).bind(target1) as InitMethod<void, TArgs>;
  const m2 = method2 && (method2 as () => void | PromiseLike<undefined>).bind(target2) as InitMethod<void, TArgs>;

  if (!m2) {
    return m1;
  }
  if (!m1) {
    return m2;
  }

  return async (...args) => {
    await m1(...args);
    await m2(...args);
  };
}
