import { ContextRegistry, ContextSources, ContextSourcesProvider, ContextTarget, ContextValues } from 'context-values';
import { BootstrapContext } from '../bootstrap-context';

/**
 * @internal
 */
export class BootstrapValueRegistry extends ContextRegistry<BootstrapContext> {

  readonly values: ContextValues;

  static create(): BootstrapValueRegistry {
    return new BootstrapValueRegistry();
  }

  private constructor() {
    super();
    this.values = this.newValues();
  }

}
