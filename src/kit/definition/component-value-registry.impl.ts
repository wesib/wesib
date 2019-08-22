import { ContextRegistry, ContextSeeds } from 'context-values';
import { ComponentContext } from '../../component';

/**
 * @internal
 */
export class ComponentValueRegistry extends ContextRegistry<ComponentContext> {

  static create(initial?: ContextSeeds<ComponentContext>): ComponentValueRegistry {
    return new ComponentValueRegistry(initial);
  }

  private constructor(initial?: ContextSeeds<ComponentContext>) {
    super(initial);
  }

}
