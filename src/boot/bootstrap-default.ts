/**
 * @module @wesib/wesib
 */
import { ContextKey, ContextKeyDefault } from 'context-values';
import { BootstrapContext } from './bootstrap-context';

/**
 * Provides a default value for bootstrap context key.
 *
 * @param provide  A function accepting bootstrap context and target key as parameters, and returning either a default
 * value, or `null`/`undefined` if unknown.
 *
 * @returns A provider of default value for bootstrap context value key.
 */
export function bootstrapDefault<Value, Key extends ContextKey<any, any, any>>(
    provide: (this: void, context: BootstrapContext, key: Key) => Value | null | undefined,
): ContextKeyDefault<Value, Key> {
  return (context, key) => {

    const bootstrapContext = context.get(BootstrapContext);

    return context === bootstrapContext ? provide(bootstrapContext, key) : bootstrapContext.get(key);
  };
}
