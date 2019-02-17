import { SingleContextKey } from 'context-values';
import { DefinitionContext } from './definition-context';

/**
 * @internal
 */
export const definitionContextKey = /*#__PURE__*/ new SingleContextKey<DefinitionContext<any>>('definition-context');
