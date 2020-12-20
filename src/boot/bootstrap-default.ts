/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { ContextKey, ContextKeyDefault } from '@proc7ts/context-values';
import { BootstrapContext } from './bootstrap-context';

/**
 * Provides a default value for bootstrap context key.
 *
 * @category Core
 * @typeParam TValue - Context value type.
 * @typeParam TKey - Context key type.
 * @param provide - A function accepting bootstrap context and target key as parameters, and returning either a default
 * value, or `null`/`undefined` if unknown.
 *
 * @returns A provider of default value for bootstrap context value key.
 */
export function bootstrapDefault<TValue, TKey extends ContextKey<any, any, any>>(
    provide: (this: void, context: BootstrapContext, key: TKey) => TValue | null | undefined,
): ContextKeyDefault<TValue, TKey> {
  return (context, key): TValue | null | undefined => {

    const bootstrapContext = context.get(BootstrapContext);

    return context === bootstrapContext
        ? provide(bootstrapContext, key)
        : bootstrapContext.get(key) as TValue;
  };
}
