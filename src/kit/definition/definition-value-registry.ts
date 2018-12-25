import { ContextRegistry, ContextSourcesProvider } from 'context-values';
import { DefinitionContext } from '../../component/definition';

/**
 * @internal
 */
export class DefinitionValueRegistry extends ContextRegistry<DefinitionContext<any>> {

  static create(initial?: ContextSourcesProvider<DefinitionContext<any>>): DefinitionValueRegistry {
    return new DefinitionValueRegistry(initial);
  }

  private constructor(initial?: ContextSourcesProvider<DefinitionContext<any>>) {
    super(initial);
  }

}