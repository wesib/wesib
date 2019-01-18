import { ContextRegistry, ContextSourcesProvider, ContextValues } from 'context-values';
import { DefinitionContext } from '../../component/definition';

/**
 * @internal
 */
export class DefinitionValueRegistry extends ContextRegistry<DefinitionContext<any>> {

  static create(initial?: ContextSourcesProvider<DefinitionContext<any>> | ContextValues): DefinitionValueRegistry {
    return new DefinitionValueRegistry(initial);
  }

  constructor(initial?: ContextSourcesProvider<DefinitionContext<any>> | ContextValues) {
    super(initial);
  }

}
