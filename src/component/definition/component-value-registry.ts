import { ContextRegistry, ContextSourcesProvider } from 'context-values';
import { ComponentContext } from '../component-context';

/**
 * @internal
 */
export class ComponentValueRegistry extends ContextRegistry<ComponentContext<any>> {

  static create(initial?: ContextSourcesProvider<ComponentContext<any>>): ComponentValueRegistry {
    return new ComponentValueRegistry(initial);
  }

  private constructor(initial?: ContextSourcesProvider<ComponentContext<any>>) {
    super(initial);
  }

}
