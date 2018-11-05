import { ContextValueRegistry, ContextValueSourceProvider } from '../../common';
import { DefinitionContext } from './definition-context';

/**
 * @internal
 */
export class DefinitionValueRegistry extends ContextValueRegistry<DefinitionContext<any>> {

  static create(initial?: ContextValueSourceProvider<DefinitionContext<any>>): DefinitionValueRegistry {
    return new DefinitionValueRegistry(initial);
  }

  private constructor(initial?: ContextValueSourceProvider<DefinitionContext<any>>) {
    super(initial);
  }

}
