import { ContextValueRegistry } from '../common';
import { PreBootstrapContext } from './bootstrap-context';

/**
 * @internal
 */
export class BootstrapValueRegistry extends ContextValueRegistry<PreBootstrapContext> {

  readonly values: PreBootstrapContext;

  static create(): BootstrapValueRegistry {
    return new BootstrapValueRegistry();
  }

  private constructor() {
    super();
    this.values = this.newValues();
  }

}
