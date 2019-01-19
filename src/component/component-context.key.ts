import { ContextKey, SingleContextKey } from 'context-values';
import { ComponentContext } from './component-context';

/**
 * @internal
 */
export const componentContextKey: ContextKey<ComponentContext<any>> = new SingleContextKey('component-context');
