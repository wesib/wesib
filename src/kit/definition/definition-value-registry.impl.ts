import { ContextRegistry, ContextSourcesProvider, ContextValues } from 'context-values';
import { DefinitionContext } from '../../component/definition';

/**
 * @internal
 */
export class DefinitionValueRegistry extends ContextRegistry<DefinitionContext> {

  static create(initial?: ContextSourcesProvider<DefinitionContext> | ContextValues): DefinitionValueRegistry {
    return new DefinitionValueRegistry(initial);
  }

  constructor(initial?: ContextSourcesProvider<DefinitionContext> | ContextValues) {
    super(initial);
  }

}
