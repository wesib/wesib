import { CxAsset } from '@proc7ts/context-values';
import { OnEvent } from '@proc7ts/fun-events';
import { Supply } from '@proc7ts/supply';
import { ComponentContext } from '../component-context';
import { ComponentClass } from './component-class';
import { DefinitionContext } from './definition-context';

/**
 * Component definition setup.
 *
 * It is passed to {@link ComponentDef.setup} method to set up the bootstrap. E.g. by providing definition
 * or component context values.
 *
 * @category Core
 */
export interface DefinitionSetup<T extends object = any> {
  /**
   * Component class constructor.
   */
  readonly componentType: ComponentClass<T>;

  /**
   * An `OnEvent` sender of component definition context upon its readiness.
   *
   * The custom element class is not constructed until component definition is complete.
   * The registered receiver will be notified when the custom element class is constructed.
   *
   * If the custom element class is constructed already, the receiver will be notified immediately.
   */
  readonly whenReady: OnEvent<[DefinitionContext<T>]>;

  /**
   * An `OnEvent` sender of component context upon its instantiation.
   *
   * If component instantiated after the receiver is registered, that receiver would receive an instantiated component's
   * context immediately.
   *
   * If component already exists when the receiver is registered, that receiver would receive instantiated component's
   * context only when/if component is {@link ComponentContext.whenConnected connected}. This is to prevent resource
   * leaking on disconnected components that may be never used again.
   */
  readonly whenComponent: OnEvent<[ComponentContext<T>]>;

  /**
   * Provides asset for component definition context entry.
   *
   * @typeParam TValue - Context value type.
   * @typeParam TAsset - Context value asset type.
   * @param asset - Context entry asset.
   *
   * @returns Asset supply. Revokes provided asset once cut off.
   */
  perDefinition<TValue, TAsset = TValue>(asset: CxAsset<TValue, TAsset, DefinitionContext>): Supply;

  /**
   * Provides asset for entry available in contexts of each component of the defined component type.
   *
   * @typeParam TValue - Context value type.
   * @typeParam TAsset - Context value asset type.
   * @param asset - Context entry asset.
   *
   * @returns Asset supply. Revokes provided asset once cut off.
   */
  perComponent<TValue, TAsset = TValue>(asset: CxAsset<TValue, TAsset, ComponentContext>): Supply;
}
