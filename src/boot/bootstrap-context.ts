/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { ContextKey, ContextKey__symbol, ContextValues } from '@proc7ts/context-values';
import { OnEvent } from '@proc7ts/fun-events';
import { Class } from '@proc7ts/primitives';
import { ComponentClass, DefinitionContext } from '../component/definition';
import { FeatureRef } from '../feature';
import { BootstrapContext__key } from './bootstrap-context.key.impl';

/**
 * Components bootstrap context.
 *
 * An instance of this class is passed to {@link FeatureDef.Options.init} method so that the feature can configure
 * itself.
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
   * @typeParam T - A type of component.
   * @param componentType - Component class constructor.
   *
   * @return An `OnEvent` sender of definition context sent when the given `componentType` is registered.
   */
  abstract whenDefined<T extends object>(componentType: ComponentClass<T>): OnEvent<[DefinitionContext<T>]>;

  /**
   * Allows to loads the given `feature`.
   *
   * @param feature - The feature to load.
   *
   * @returns  Loaded feature reference.
   */
  abstract load(feature: Class): FeatureRef;

}
