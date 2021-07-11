import { CxAsset, CxEntry, cxSingle, CxValues } from '@proc7ts/context-values';
import { OnEvent } from '@proc7ts/fun-events';
import { Class } from '@proc7ts/primitives';
import { Supply } from '@proc7ts/supply';
import { ComponentContext } from '../component-context';
import { ComponentElement } from '../component-slot';
import { ComponentClass } from './component-class';
import { ElementDef } from './element-def';

/**
 * Component definition context.
 *
 * Extends `ContextValues` interface. The values are provided by corresponding providers registered with
 * {@link BootstrapSetup.perDefinition} and {@link DefinitionSetup.perDefinition} methods. All {@link BootstrapContext}
 * values are available too.
 *
 * @category Core
 * @typeParam T - A type of component.
 */
export interface DefinitionContext<T extends object = any> extends CxValues {

  /**
   * Component class constructor.
   */
  readonly componentType: ComponentClass<T>;

  /**
   * Custom element class constructor.
   *
   * It is an error accessing this property before the element class is created, e.g. from inside of
   * {@link ComponentDef.define} function. In such case you may wish to add a `whenReady()` callback.
   */
  readonly elementType: Class;

  /**
   * Custom element definition.
   */
  readonly elementDef: ElementDef;

  /**
   * An `OnEvent` sender of component definition context upon its readiness.
   *
   * The custom element class is not constructed until component definition is complete.
   * The registered receiver will be notified when the custom element class is constructed.
   *
   * If the custom element class is constructed already, the receiver will be notified immediately.
   */
  readonly whenReady: OnEvent<[this]>;

  /**
   * An `OnEvent` sender of component context upon its instantiation.
   *
   * If component instantiated after the receiver is registered, that receiver would receive an instantiated component's
   * context immediately.
   *
   * If component already exists when the receiver is registered, that receiver would receive instantiated component's
   * context only when/if component is {@link ComponentContext.whenConnected connected}. This is to prevent resource
   * leaks on destroyed components.
   */
  readonly whenComponent: OnEvent<[ComponentContext<T>]>;

  /**
   * Mounts a component to arbitrary element.
   *
   * This method creates a component, but instead of creating a custom element for, it mounts it to the target
   * `element`.
   *
   * It is up to the features to update the target element. They can use a {@link ComponentContext.mounted} flag
   * to check whether the component is mounted or constructed in a standard way.
   *
   * The constructed component connection state is maintained by {@link DocumentRenderKit document render kit}.
   *
   * @param element - Target element to mount new component to.
   *
   * @returns Mounted component context.
   *
   * @throws Error If target element is already bound to some component.
   */
  mountTo(element: ComponentElement<T>): ComponentContext<T>;

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

/**
 * Context entry containing definition context as its value.
 *
 * @category Core
 */
export const DefinitionContext: CxEntry<DefinitionContext> = {
  perContext: (/*#__PURE__*/ cxSingle()),
  toString: () => '[DefinitionContext]',
};
