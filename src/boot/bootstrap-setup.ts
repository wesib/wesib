import { CxAsset } from '@proc7ts/context-values';
import { OnEvent } from '@proc7ts/fun-events';
import { Class } from '@proc7ts/primitives';
import { Supply } from '@proc7ts/supply';
import { ComponentContext } from '../component';
import { ComponentClass, DefinitionContext, DefinitionSetup } from '../component/definition';
import { FeatureContext } from '../feature';
import { BootstrapContext } from './bootstrap-context';

/**
 * Bootstrap context setup.
 *
 * It is passed to {@link FeatureDef.setup} method to set up the bootstrap. E.g. by providing bootstrap context
 * values.
 *
 * @category Core
 */
export interface BootstrapSetup {
  /**
   * Feature class performing bootstrap setup.
   */
  readonly feature: Class;

  /**
   * An `OnEvent` sender of feature readiness event.
   *
   * The registered receiver will be notified once bootstrap is complete and the feature is loaded.
   *
   * If the above conditions satisfied already, the receiver will be notified immediately.
   */
  readonly whenReady: OnEvent<[FeatureContext]>;

  /**
   * An `OnEvent` sender of component definition events.
   *
   * The registered receiver will be notified when new component class is defined, but before its custom element class
   * constructed.
   */
  readonly onDefinition: OnEvent<[DefinitionContext]>;

  /**
   * An `OnEvent` sender of component construction events.
   *
   * The registered receiver will be notified right before component is constructed.
   */
  readonly onComponent: OnEvent<[ComponentContext]>;

  /**
   * Provides asset for bootstrap context entry before context creation.
   *
   * @typeParam TValue - Context value type.
   * @typeParam TAsset - Context value asset type.
   * @param asset - Context entry asset.
   *
   * @returns Asset supply. Revokes provided asset once cut off.
   */
  provide<TValue, TAsset = TValue>(asset: CxAsset<TValue, TAsset, BootstrapContext>): Supply;

  /**
   * Provides asset for entry available in each component definition context.
   *
   * @typeParam TValue - Context value type.
   * @typeParam TAsset - Context value asset type.
   * @param asset - Context entry asset.
   *
   * @returns Asset supply. Revokes provided asset once cut off.
   */
  perDefinition<TValue, TAsset = TValue>(asset: CxAsset<TValue, TAsset, DefinitionContext>): Supply;

  /**
   * Provides asset for entry available in each component context.
   *
   * @typeParam TValue - Context value type.
   * @typeParam TAsset - Context value asset type.
   * @param asset - Context entry asset.
   *
   * @returns Asset supply. Revokes provided asset once cut off.
   */
  perComponent<TValue, TAsset = TValue>(asset: CxAsset<TValue, TAsset, ComponentContext>): Supply;

  /**
   * Sets up the definition of component of the given type.
   *
   * Whenever the definition of component of the given type or any of its subtype starts, the returned `OnEvent` sender
   * sends a {@link DefinitionSetup} instance, that can be used to set up that definition.
   *
   * @param componentType - Target component type.
   *
   * @returns An `OnEvent` sender of component definition setup instances.
   */
  setupDefinition<T extends object>(componentType: ComponentClass<T>): OnEvent<[DefinitionSetup]>;
}
