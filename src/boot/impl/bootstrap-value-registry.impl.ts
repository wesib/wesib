import { ContextKey, ContextKey__symbol, ContextRegistry, ContextValues, SingleContextKey } from 'context-values';
import { BootstrapContext } from '../bootstrap-context';

const BootstrapValueRegistry__key =
    /*#__PURE__*/ new SingleContextKey<BootstrapValueRegistry>('bootstrap-value-registry');

/**
 * @internal
 */
export class BootstrapValueRegistry extends ContextRegistry<BootstrapContext> {

  static get [ContextKey__symbol](): ContextKey<BootstrapValueRegistry> {
    return BootstrapValueRegistry__key;
  }

  readonly values: ContextValues;

  static create(): BootstrapValueRegistry {
    return new BootstrapValueRegistry();
  }

  private constructor() {
    super();
    this.provide({ a: BootstrapValueRegistry, is: this });
    this.values = this.newValues();
  }

}
