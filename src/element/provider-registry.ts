import { ContextProviderRegistry } from '../common';
import { ComponentContext } from '../component';

/**
 * @internal
 */
export class ProviderRegistry extends ContextProviderRegistry<ComponentContext<any, any>> {

  static create(): ProviderRegistry {
    return new ProviderRegistry();
  }

  private constructor() {
    super();
  }

}
