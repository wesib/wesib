import { ContextKey, ContextKey__symbol, ContextValues, ContextValueSpec } from '@proc7ts/context-values';
import { OnEvent } from '@proc7ts/fun-events';
import { Class, Supply } from '@proc7ts/primitives';
import { ComponentContext } from '../component-context';
import { ComponentMount } from '../component-mount';
import { ComponentElement } from '../component-slot';
import { ComponentClass } from './component-class';
import { DefinitionContext__key } from './definition.context.key.impl';
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
export abstract class DefinitionContext<T extends object = any> extends ContextValues {

  /**
   * A key of definition context value containing the definition context itself.
   */
  static get [ContextKey__symbol](): ContextKey<DefinitionContext> {
    return DefinitionContext__key;
  }

  /**
   * Component class constructor.
   */
  abstract readonly componentType: ComponentClass<T>;

  /**
   * Custom element class constructor.
   *
   * It is an error accessing this property before the element class is created, e.g. from inside of
   * {@link ComponentDef.define} function. In such case you may wish to add a `whenReady()` callback.
   */
  abstract readonly elementType: Class;

  /**
   * Custom element definition.
   */
  get elementDef(): ElementDef {
    return this.get(ElementDef);
  }

  /**
   * An `OnEvent` sender of component definition context upon its readiness.
   *
   * The custom element class is not constructed until component definition is complete.
   * The registered receiver will be notified when the custom element class is constructed.
   *
   * If the custom element class is constructed already, the receiver will be notified immediately.
   */
  abstract readonly whenReady: OnEvent<[this]>;

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
  abstract readonly whenComponent: OnEvent<[ComponentContext<T>]>;

  /**
   * Mounts a component to arbitrary element.
   *
   * This method creates a component, but instead of creating a custom element for, it mounts it to the target
   * `element`.
   *
   * It is up to the features to update the target element. They can use a `ComponentContext.mount` property to check
   * whether the component is mounted or is constructed in standard way.
   *
   * The constructed component will be in disconnected state. To update its connection state either update a
   * `ComponentMount.connected` property, or use a `connectTo()` method.
   *
   * @param element - Target element to mount new component to.
   *
   * @returns New component mount.
   *
   * @throws Error If target element is already bound to some component.
   */
  abstract mountTo(element: ComponentElement<T>): ComponentMount<T>;

  /**
   * Connects a component to arbitrary element.
   *
   * This method does the same as `mountTo()`, but also marks the mounted component as connected.
   *
   * @param element - Target element to mount new component to.
   *
   * @returns New component mount.
   *
   * @throws Error If target element is already bound to some component.
   */
  connectTo(element: any): ComponentMount<T> {

    const mount = this.mountTo(element);

    mount.connect();

    return mount;
  }

  /**
   * Provides a value available in the context of each component of the defined component type.
   *
   * @typeParam TSrc - The type of context value sources.
   * @typeParam TDeps - A type of dependencies.
   * @param spec - Component context value specifier.
   *
   * @returns A value supply that removes the given context value specifier once cut off.
   */
  abstract perComponent<TSrc, TDeps extends any[]>(
      spec: ContextValueSpec<ComponentContext<T>, unknown, TSrc, TDeps>,
  ): Supply;

}
