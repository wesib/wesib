import { ContextKey, ContextKey__symbol, ContextRegistry, ContextSeeds, SingleContextKey } from 'context-values';
import { ComponentContext } from '../../component';
import { bootstrapDefault } from '../bootstrap-default';

const ComponentValueRegistry__key = new SingleContextKey<ComponentValueRegistry>(
    'component-value-registry',
    {
      byDefault: bootstrapDefault(() => new ComponentValueRegistry()),
    },
);

/**
 * @internal
 */
export class ComponentValueRegistry extends ContextRegistry<ComponentContext> {

  static get [ContextKey__symbol](): ContextKey<ComponentValueRegistry> {
    return ComponentValueRegistry__key;
  }

  constructor(initial?: ContextSeeds<ComponentContext>) {
    super(initial);
  }

}
