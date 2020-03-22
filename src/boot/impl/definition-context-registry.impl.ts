import { ContextKey, ContextKey__symbol, ContextRegistry, SingleContextKey } from '@proc7ts/context-values';
import { DefinitionContext } from '../../component/definition';
import { bootstrapDefault } from '../bootstrap-default';

const DefinitionContextRegistry__key = (/*#__PURE__*/ new SingleContextKey<DefinitionContextRegistry>(
    'definition-context-registry',
    {
      byDefault: bootstrapDefault(context => new DefinitionContextRegistry(context)),
    },
));

/**
 * @internal
 */
export class DefinitionContextRegistry extends ContextRegistry<DefinitionContext> {

  static get [ContextKey__symbol](): ContextKey<DefinitionContextRegistry> {
    return DefinitionContextRegistry__key;
  }

}
