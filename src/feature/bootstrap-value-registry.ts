import { ContextValueRegistry } from '../common';
import { BootstrapContext } from './bootstrap-context';

/**
 * @internal
 */
export class BootstrapValueRegistry extends ContextValueRegistry<BootstrapContext> {

  static create(): BootstrapValueRegistry {
    return new BootstrapValueRegistry();
  }

  private constructor() {
    super();
  }

}
