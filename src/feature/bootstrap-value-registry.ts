import { ContextValueRegistry, ContextValues } from '../common';
import { BootstrapContext } from './bootstrap-context';

/**
 * @internal
 */
export class BootstrapValueRegistry extends ContextValueRegistry<BootstrapContext> {

  readonly values: ContextValues;

  static create(): BootstrapValueRegistry {
    return new BootstrapValueRegistry();
  }

  private constructor() {
    super();
    this.values = this.newValues();
  }

}
