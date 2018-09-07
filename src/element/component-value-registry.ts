import { ContextValueRegistry, ContextValueSources } from '../common';
import { ComponentContext } from '../component';

/**
 * @internal
 */
export class ComponentValueRegistry extends ContextValueRegistry<ComponentContext<any, any>> {

  static create(initial?: ContextValueSources): ComponentValueRegistry {
    return new ComponentValueRegistry(initial);
  }

  private constructor(initial?: ContextValueSources) {
    super(initial);
  }

}
