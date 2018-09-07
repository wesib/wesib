import { ContextValueRegistry } from '../common/context';
import { BootstrapValues } from './bootstrap-values';

/**
 * @internal
 */
export class BootstrapValueRegistry extends ContextValueRegistry<BootstrapValues> {

  readonly values: BootstrapValues;

  static create(): BootstrapValueRegistry {
    return new BootstrapValueRegistry();
  }

  private constructor() {
    super();
    this.values = this.newValues();
  }

}
