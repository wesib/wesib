import { ContextKey, ContextKey__symbol, ContextRegistry, ContextValues, SingleContextKey } from 'context-values';
import { BootstrapContext } from '../bootstrap-context';

const BootstrapContextRegistry__key = (
    /*#__PURE__*/ new SingleContextKey<BootstrapContextRegistry>('bootstrap-context-registry')
);

/**
 * @internal
 */
export class BootstrapContextRegistry extends ContextRegistry<BootstrapContext> {

  static get [ContextKey__symbol](): ContextKey<BootstrapContextRegistry> {
    return BootstrapContextRegistry__key;
  }

  readonly values: ContextValues;

  static create(): BootstrapContextRegistry {
    return new BootstrapContextRegistry();
  }

  private constructor() {
    super();
    this.provide({ a: BootstrapContextRegistry, is: this });
    this.values = this.newValues();
  }

}
