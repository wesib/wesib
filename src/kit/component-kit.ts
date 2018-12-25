import { ContextKey, SingleContextKey } from 'context-values';
import { ComponentClass } from '../component';

/**
 * A component kit.
 *
 * A component kit instance is created by `bootstrapComponents()` function. It is also available in `BootstrapContext`
 * under `ComponentKit.key` key.
 */
export abstract class ComponentKit {

  /**
   * A key of bootstrap context value containing a constructing component kit instance.
   */
  static readonly key: ContextKey<ComponentKit> = new SingleContextKey('component-kit');

  /**
   * Allows to wait for component definition.
   *
   * This corresponds to `window.customElements.whenDefined()` method.
   *
   * @param componentType Component class constructor.
   *
   * @return A promise that is resolved when the given `componentType` is registered.
   *
   * @throws TypeError If `componentType` does not contain a component definition.
   */
  abstract whenDefined(componentType: ComponentClass<any>): Promise<void>;

}
