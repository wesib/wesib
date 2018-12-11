import { ContextRegistry, ContextSources, ContextTarget, ContextValues } from 'context-values';
import { BootstrapContext } from './bootstrap-context';

/**
 * @internal
 */
export class BootstrapValueRegistry extends ContextRegistry<BootstrapContext> {

  readonly values: ContextValues;
  readonly valueSources: <S>(this: void, request: ContextTarget<S>) => ContextSources<S>;

  static create(): BootstrapValueRegistry {
    return new BootstrapValueRegistry();
  }

  private constructor() {
    super();
    this.values = this.newValues();
    this.valueSources =
        <S>(request: ContextTarget<S>) => this.values.get.call(this.values, request) as ContextSources<S>;
  }

}
