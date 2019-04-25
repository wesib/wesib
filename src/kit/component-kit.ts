import { ContextKey, SingleContextKey } from 'context-values';
import { ComponentClass } from '../component';
import { ComponentFactory } from '../component/definition';

const ComponentKit__key = /*#__PURE__*/ new SingleContextKey<ComponentKit>('component-kit');

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
  static get key(): ContextKey<ComponentKit> {
    return ComponentKit__key;
  }

  /**
   * Allows to wait for component definition.
   *
   * This corresponds to `window.customElements.whenDefined()` method.
   *
   * @param componentType Component class constructor.
   *
   * @return A promise that is resolved to component factory when the given `componentType` is registered.
   *
   * @throws TypeError If `componentType` does not contain a component definition.
   */
  abstract whenDefined<C extends object>(componentType: ComponentClass<C>): Promise<ComponentFactory<C>>;

}
