import { SingleContextKey } from 'context-values';
import { BootstrapContext } from './bootstrap-context';

/**
 * @internal
 */
export const bootstrapContextKey = /*#__PURE__*/ new SingleContextKey<BootstrapContext>('bootstrap-context');
