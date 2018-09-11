import { ContextValueRegistry, ContextValueSource } from '../common';
import { ComponentContext } from '../component';

/**
 * @internal
 */
export class ComponentValueRegistry extends ContextValueRegistry<ComponentContext<any>> {

  static create(initial?: ContextValueSource<ComponentContext<any>>): ComponentValueRegistry {
    return new ComponentValueRegistry(initial);
  }

  private constructor(initial?: ContextValueSource<ComponentContext<any>>) {
    super(initial);
  }

}
