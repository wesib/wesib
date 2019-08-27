/**
 * @module @wesib/wesib
 */
import { ContextKey, ContextKey__symbol, ContextValues } from 'context-values';
import { OnEvent } from 'fun-events';
import { ComponentContext } from '../component';
import { ComponentClass, ComponentFactory, DefinitionContext } from '../component/definition';
import { BootstrapContext__key } from './bootstrap-context.key.impl';

/**
 * Components bootstrap context.
 *
 * An instance of this class is passed to [[FeatureDef.init]] method so that the feature can configure itself.
 *
 * Extends `BootstrapValues` interface. The values are {@link FeatureDef.set pre-configured} in feature definitions.
 *
 * @category Core
 */
export abstract class BootstrapContext extends ContextValues {

  /**
   * A key of bootstrap context value containing the bootstrap context itself.
   */
  static get [ContextKey__symbol](): ContextKey<BootstrapContext> {
    return BootstrapContext__key;
  }

  /**
   * Registers component definition listener.
   *
   * This listener will be called when new component class is defined, but before its custom element class constructed.
   *
   * @param listener  A listener to notify on each component definition.
   *
   * @return An event interest instance.
   */
  abstract readonly onDefinition: OnEvent<[DefinitionContext]>;

  /**
   * Registers component construction listener.
   *
   * This listener will be called right before component is constructed.
   *
   * @param listener  A listener to notify on each component construction.
   *
   * @return An event interest instance.
   */
  abstract readonly onComponent: OnEvent<[ComponentContext]>;

  /**
   * Allows to wait for component definition.
   *
   * This corresponds to `window.customElements.whenDefined()` method.
   *
   * @param componentType  Component class constructor.
   *
   * @return A promise that is resolved to component factory when the given `componentType` is registered.
   *
   * @throws TypeError  If `componentType` does not contain a component definition.
   */
  abstract whenDefined<C extends object>(componentType: ComponentClass<C>): Promise<ComponentFactory<C>>;

  /**
   * Registers bootstrap readiness callback.
   *
   * The registered callback function will be called once bootstrap is complete.
   *
   * If bootstrap is complete already, the callback will be notified immediately.
   *
   * @param callback  A callback to notify on bootstrap completion.
   */
  abstract whenReady(callback: (this: this) => void): void;

}
