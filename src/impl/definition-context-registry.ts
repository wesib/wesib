import { ContextRef, ContextRegistry, SingleContextKey } from '@proc7ts/context-values';
import { bootstrapDefault } from '../boot';
import { DefinitionContext } from '../component/definition';

/**
 * @internal
 */
export type PerDefinitionRegistry = DefinitionContextRegistry;

/**
 * @internal
 */
export const PerDefinitionRegistry: ContextRef<PerDefinitionRegistry> = (
    /*#__PURE__*/ new SingleContextKey<DefinitionContextRegistry>(
    'per-definition-registry',
    {
      byDefault: bootstrapDefault(bsContext => new DefinitionContextRegistry(bsContext)),
    },
));

/**
 * @internal
 */
export class DefinitionContextRegistry extends ContextRegistry<DefinitionContext> {
}
