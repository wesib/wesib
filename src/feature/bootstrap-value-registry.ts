import { ContextValueKey, ContextValueRegistry, ContextValues, RevertibleIterable } from '../common';
import { BootstrapContext } from './bootstrap-context';

/**
 * @internal
 */
export class BootstrapValueRegistry extends ContextValueRegistry<BootstrapContext> {

  readonly values: ContextValues;
  readonly valueSources: <V, S>(this: void, key: ContextValueKey<V, S>) => RevertibleIterable<S>;

  static create(): BootstrapValueRegistry {
    return new BootstrapValueRegistry();
  }

  private constructor() {
    super();
    this.values = this.newValues();
    this.valueSources = <V, S>(key: ContextValueKey<V, S>) => this.values.get.call(this.values, key.sourcesKey);
  }

}
