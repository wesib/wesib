import { ContextKey, SingleContextKey } from 'context-values';
import { BootstrapContext } from './bootstrap-context';

export const bootstrapContextKey: ContextKey<BootstrapContext> = new SingleContextKey('bootstrap-context');
