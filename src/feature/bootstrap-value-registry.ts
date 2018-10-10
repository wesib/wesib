import { ContextValueRegistry, ContextValues, ProvidedContextValue, RevertibleIterable } from '../common';
import { BootstrapContext } from './bootstrap-context';

/**
 * @internal
 */
export class BootstrapValueRegistry extends ContextValueRegistry<BootstrapContext> {

  readonly values: ContextValues;
  readonly valueSources: <S>(this: void, request: ProvidedContextValue<S>) => RevertibleIterable<S>;

  static create(): BootstrapValueRegistry {
    return new BootstrapValueRegistry();
  }

  private constructor() {
    super();
    this.values = this.newValues();
    this.valueSources = <S>(request: ProvidedContextValue<S>) => this.values.get.call(this.values, request);
  }

}
