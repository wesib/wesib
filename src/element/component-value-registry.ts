import { ContextValueRegistry } from '../common';
import { ComponentContext } from '../component';

/**
 * @internal
 */
export class ComponentValueRegistry extends ContextValueRegistry<ComponentContext<any, any>> {

  static create(): ComponentValueRegistry {
    return new ComponentValueRegistry();
  }

  private constructor() {
    super();
  }

}
