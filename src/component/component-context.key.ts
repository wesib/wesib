import { SingleContextKey } from 'context-values';
import { ComponentContext } from './component-context';

/**
 * @internal
 */
export const componentContextKey = /*#__PURE__*/ new SingleContextKey<ComponentContext<any>>('component-context');
