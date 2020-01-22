/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { ContextKey, ContextKey__symbol, ContextValues } from 'context-values';
import { OnEvent } from 'fun-events';
import { Class } from '../common';
import { ComponentClass, ComponentFactory } from '../component/definition';
import { FeatureRef } from '../feature';
import { BootstrapContext__key } from './bootstrap-context.key.impl';

/**
 * Components bootstrap context.
 *
 * An instance of this class is passed to [[FeatureDef.Options.init]] method so that the feature can configure itself.
 *
 * Extends `BootstrapValues` interface. The values could be {@link BootstrapSetup.provide pre-configured} in feature
 * definitions.
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
   * An `OnEvent` sender of bootstrap readiness event.
   *
   * The registered receiver will be notified once bootstrap is complete.
   *
   * If bootstrap is complete already, the receiver will be notified immediately.
   */
  abstract readonly whenReady: OnEvent<[BootstrapContext]>;

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
   * Allows to loads the given `feature`.
   *
   * @param feature  The feature to load.
   *
   * @returns  Loaded feature reference.
   */
  abstract load(feature: Class): FeatureRef;

}
