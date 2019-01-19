import { SingleContextKey } from 'context-values';
import { DefinitionContext } from './definition-context';

/**
 * @internal
 */
export const definitionContextKey = new SingleContextKey<DefinitionContext<any>>('definition-context');
