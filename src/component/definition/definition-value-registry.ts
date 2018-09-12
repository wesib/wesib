import { ContextValueRegistry, ContextValueSource } from '../../common';
import { DefinitionContext } from './definition-context';

/**
 * @internal
 */
export class DefinitionValueRegistry extends ContextValueRegistry<DefinitionContext<any>> {

  static create(initial?: ContextValueSource<DefinitionContext<any>>): DefinitionValueRegistry {
    return new DefinitionValueRegistry(initial);
  }

  private constructor(initial?: ContextValueSource<DefinitionContext<any>>) {
    super(initial);
  }

}
