import { ContextRegistry, ContextSeeds, ContextValues } from 'context-values';
import { DefinitionContext } from '../../component/definition';

/**
 * @internal
 */
export class DefinitionValueRegistry extends ContextRegistry<DefinitionContext> {

  static create(initial?: ContextSeeds<DefinitionContext> | ContextValues): DefinitionValueRegistry {
    return new DefinitionValueRegistry(initial);
  }

  constructor(initial?: ContextSeeds<DefinitionContext> | ContextValues) {
    super(initial);
  }

}
