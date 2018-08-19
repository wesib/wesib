import { ComponentContext, ComponentValueKey, ComponentValueProvider } from '../component';

export class ProviderRegistry {

  private readonly _providers = new Map<ComponentValueKey<any>, ComponentValueProvider<any>>();

  static create(): ProviderRegistry {
    return new ProviderRegistry();
  }

  private constructor() {
  }

  provide<V>(key: ComponentValueKey<V>, provider: ComponentValueProvider<V>): void {

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

  get<E extends HTMLElement, V>(key: ComponentValueKey<V>, context: ComponentContext<E>): V | null | undefined {

    const provider: ComponentValueProvider<V> | undefined = this._providers.get(key);

    return provider && provider(context);
  }

}
