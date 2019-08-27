import {
  ContextKey,
  ContextKey__symbol,
  ContextRegistry,
  ContextSeeds,
  ContextValues,
  SingleContextKey,
} from 'context-values';
import { DefinitionContext } from '../../component/definition';
import { bootstrapDefault } from '../bootstrap-default';

const DefinitionValueRegistry__key = new SingleContextKey<DefinitionValueRegistry>(
    'definition-value-registry',
    {
      byDefault: bootstrapDefault(context => new DefinitionValueRegistry(context)),
    },
);

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
