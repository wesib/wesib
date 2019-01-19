import { ContextKey, SingleContextKey } from 'context-values';
import { BootstrapContext } from './bootstrap-context';

/**
 * @internal
 */
export const bootstrapContextKey: ContextKey<BootstrapContext> = new SingleContextKey('bootstrap-context');
