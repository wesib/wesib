import { ContextRegistry, ContextSourcesProvider } from 'context-values';
import { ComponentContext } from '../../component';

/**
 * @internal
 */
export class ComponentValueRegistry extends ContextRegistry<ComponentContext> {

  static create(initial?: ContextSourcesProvider<ComponentContext>): ComponentValueRegistry {
    return new ComponentValueRegistry(initial);
  }

  private constructor(initial?: ContextSourcesProvider<ComponentContext>) {
    super(initial);
  }

}
