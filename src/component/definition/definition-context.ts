/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { ContextKey, ContextKey__symbol, ContextValues, ContextValueSpec } from '@proc7ts/context-values';
import { EventReceiver, EventSupply, OnEvent } from '@proc7ts/fun-events';
import { Class } from '../../common';
import { ComponentContext } from '../component-context';
import { ComponentClass } from './component-class';
import { DefinitionContext__key } from './definition.context.key.impl';
import { ElementDef } from './element-def';

/**
 * Component definition context.
 *
 * Extends `ContextValues` interface. The values are provided by corresponding providers registered with
 * [[BootstrapSetup.perDefinition]] and [[DefinitionSetup.perDefinition]] methods. All [[BootstrapContext]] values
 * are available too.
 *
 * @category Core
 * @typeparam T  A type of component.
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
   * `DefinitionListener` or `ComponentDef.define()` function. In these cases you may wish to add a `whenReady()`
   * callback.
   */
  abstract readonly elementType: Class;

  /**
   * Custom element definition.
   */
  get elementDef(): ElementDef {
    return this.get(ElementDef);
  }

  /**
   * Builds an `OnEvent` sender of component definition context upon its readiness.
   *
   * The custom element class is not constructed until component definition is complete.
   * The registered receiver will be notified when the custom element class is constructed.
   *
   * If the custom element class is constructed already, the receiver will be notified immediately.
   *
   * @returns `OnEvent` sender of this component definition context upon its readiness.
   */
  abstract whenReady(): OnEvent<[this]>;

  /**
   * Registers a receiver of component definition readiness event.
   *
   * The custom element class is not constructed until component definition is complete.
   * The registered receiver will be notified when the custom element class is constructed.
   *
   * If the custom element class is constructed already, the receiver will be notified immediately.
   *
   * @param receiver  Target receiver of this component definition context upon its readiness.
   *
   * @returns Component definition readiness event supply.
   */
  abstract whenReady(receiver: EventReceiver<[this]>): EventSupply;

  /**
   * Builds an `OnEvent` sender of component context upon its instantiation.
   *
   * If component instantiated after the receiver is registered, that receiver would receive an instantiated component's
   * context immediately.
   *
   * If component already exists when the receiver is registered, that receiver would receive instantiated component's
   * context only when/if component is {@link ComponentContext.whenConnected connected}. This is to prevent resource
   * leaks on destroyed components.
   *
   * @returns `OnEvent` sender of instantiated component context.
   */
  abstract whenComponent(): OnEvent<[ComponentContext<T>]>;

  /**
   * Starts sending component instantiation events to the given `receiver`.
   *
   * If component instantiated after the receiver is registered, that receiver would receive an instantiated component's
   * context immediately.
   *
   * If component already exists when the receiver is registered, that receiver would receive instantiated component's
   * context only when/if component is {@link ComponentContext.whenConnected connected}. This is to prevent resource
   * leaks on destroyed components.
   *
   * @param receiver  Target receiver of instantiate component contexts.
   *
   * @returns Component instantiation events supply.
   */
  abstract whenComponent(receiver: EventReceiver<[ComponentContext<T>]>): EventSupply;

  /**
   * Provides a value available in the context of each component of the defined component type.
   *
   * @typeparam Deps  A type of dependencies.
   * @typeparam Src  The type of context value sources.
   * @typeparam Seed  Value seed type.
   * @param spec  Component context value specifier.
   *
   * @returns A function that removes the given context value specifier when called.
   */
  abstract perComponent<Deps extends any[], Src, Seed>(
      spec: ContextValueSpec<ComponentContext<T>, any, Deps, Src, Seed>,
  ): () => void;

}
