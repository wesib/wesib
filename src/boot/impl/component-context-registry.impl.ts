import { ContextKey, ContextKey__symbol, ContextRegistry, SingleContextKey } from 'context-values';
import { ComponentContext } from '../../component';
import { bootstrapDefault } from '../bootstrap-default';

const ComponentContextRegistry__key = new SingleContextKey<ComponentContextRegistry>(
    'component-context-registry',
    {
      byDefault: bootstrapDefault(() => new ComponentContextRegistry()),
    },
);

/**
 * @internal
 */
export class ComponentContextRegistry extends ContextRegistry<ComponentContext> {

  static get [ContextKey__symbol](): ContextKey<ComponentContextRegistry> {
    return ComponentContextRegistry__key;
  }

}
