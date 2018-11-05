import { ContextValueRegistry, ContextValueSourceProvider } from '../../common';
import { ComponentContext } from '../component-context';

/**
 * @internal
 */
export class ComponentValueRegistry extends ContextValueRegistry<ComponentContext<any>> {

  static create(initial?: ContextValueSourceProvider<ComponentContext<any>>): ComponentValueRegistry {
    return new ComponentValueRegistry(initial);
  }

  private constructor(initial?: ContextValueSourceProvider<ComponentContext<any>>) {
    super(initial);
  }

}
