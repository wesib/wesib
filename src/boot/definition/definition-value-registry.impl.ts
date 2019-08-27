import {
  ContextKey,
  ContextKey__symbol,
  ContextRegistry,
  ContextSeeds,
  ContextValues,
  SingleContextKey,
} from 'context-values';
import { DefinitionContext } from '../../component/definition';

const DefinitionValueRegistry__key = new SingleContextKey<DefinitionValueRegistry>(
    'definition-value-registry',
    {
      byDefault(context: ContextValues) {
        return new DefinitionValueRegistry(context);
      },
    });

/**
 * @internal
 */
export class DefinitionValueRegistry extends ContextRegistry<DefinitionContext> {

  static get [ContextKey__symbol](): ContextKey<DefinitionValueRegistry> {
    return DefinitionValueRegistry__key;
  }

  constructor(initial?: ContextSeeds<DefinitionContext> | ContextValues) {
    super(initial);
  }

}
