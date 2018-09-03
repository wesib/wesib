import { ContextValueKey } from '../common';
import { ComponentContext, ComponentValueProvider } from '../component';

/**
 * @internal
 */
export class ProviderRegistry {

  private readonly _providers = new Map<ContextValueKey<any>, ComponentValueProvider<any>>();

  static create(): ProviderRegistry {
    return new ProviderRegistry();
  }

  private constructor() {
  }

  provide<V>(key: ContextValueKey<V>, provider: ComponentValueProvider<V>): void {

    const existing: ComponentValueProvider<V> | undefined = this._providers.get(key);

    if (!existing) {
      this._providers.set(key, provider);
    } else {
      this._providers.set(key, context => {

        const result = existing(context);

        return result != null ? result : provider(context);
      });
    }
  }

  get<T extends object, E extends HTMLElement, V>(
      key: ContextValueKey<V>,
      context: ComponentContext<T, E>): V | null | undefined {

    const provider: ComponentValueProvider<V> | undefined = this._providers.get(key);

    return provider && provider(context);
  }

}
