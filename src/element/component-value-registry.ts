import { ContextValueRegistry, ContextValueSource } from '../common';
import { ComponentContext } from '../component';

/**
 * @internal
 */
export class ComponentValueRegistry extends ContextValueRegistry<ComponentContext<any, any>> {

  static create(initial?: ContextValueSource<ComponentContext<any, any>>): ComponentValueRegistry {
    return new ComponentValueRegistry(initial);
  }

  private constructor(initial?: ContextValueSource<ComponentContext<any, any>>) {
    super(initial);
  }

}
