/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { ContextKey, ContextKey__symbol, ContextValues } from '@proc7ts/context-values';
import {
  EventReceiver,
  EventSupply,
  EventSupply__symbol,
  EventSupplyPeer,
  OnEvent,
  StatePath,
} from '@proc7ts/fun-events';
import { OnDomEvent } from '@proc7ts/fun-events/dom';
import { ComponentContext__key } from './component-context.key.impl';
import { ComponentEventDispatcher__key } from './component-event.key.impl';
import { ComponentMount } from './component-mount';
import { ContentRoot } from './content-root';
import { ComponentClass } from './definition';
import { StateUpdater } from './state-updater';

/**
 * A key of a custom element and component properties containing a reference to component context.
 *
 * @category Core
 */
export const ComponentContext__symbol = (/*#__PURE__*/ Symbol('component-context'));

/**
 * Component context.
 *
 * Passed to component constructor as its only parameter.
 *
 * Extends `ContextValues` interface. The values are provided by corresponding providers registered with
 * [[BootstrapSetup.perComponent]] and [[DefinitionSetup.perComponent]] methods.
 *
 * @category Core
 * @typeparam T  A type of component.
 */
export abstract class ComponentContext<T extends object = any> extends ContextValues implements EventSupplyPeer {

  /**
   * A key of component context value containing the component context instance itself.
   */
  static get [ContextKey__symbol](): ContextKey<ComponentContext> {
    return ComponentContext__key;
  }

  /**
   * Component class constructor.
   */
  abstract readonly componentType: ComponentClass<T>;

  /**
   * Custom element constructed for the component according to its type.
   *
   * E.g. `HTMLElement` instance.
   */
  abstract readonly element: any;

  /**
   * A component instance.
   *
   * It is an error accessing this property before the component is created, e.g. from inside of component constructor
   * or {@link DefinitionContext.whenComponent component instantiation event} receiver. A [[whenReady]] callback could
   * be utilized to work this around.
   */
  abstract readonly component: T;

  /**
   * Component mount.
   *
   * This is defined when component is mounted to arbitrary element by [[ComponentFactory.mountTo]]. Ot is `undefined`
   * for components created in standard way.
   */
  abstract readonly mount: ComponentMount<T> | undefined;

  /**
   * Whether the custom element is connected.
   *
   * This becomes `true` right before [[whenOn]] event is sent, and becomes `false` right before [[whenOff]] event is
   * sent.
   */
  abstract readonly connected: boolean;

  /**
   * An event supply that {@link destroy destroys} component when cut off.
   */
  abstract readonly [EventSupply__symbol]: EventSupply;

  /**
   * Updates component's state.
   *
   * This is a shorthand for invoking a component {@link StateUpdater state updater} .
   *
   * Note that state update has no effect unless [[StateSupport]] feature is enabled or [[StateUpdater]] context value
   * is provided by other means.
   *
   * @typeparam V  A type of changed value.
   * @param key  Changed value key.
   * @param newValue  New value.
   * @param oldValue  Previous value.
   */
  readonly updateState: StateUpdater = updateComponentState.bind(this);

  /**
   * Extracts component context from its custom element or from component itself.
   *
   * @param element  Custom element instance created for the component or the component itself.
   *
   * @return Component context reference stored under [[ComponentContext__symbol]] key.
   *
   * @throws TypeError  When the given `element` does not contain component context reference.
   */
  static of<T extends object>(element: any): ComponentContext<T> {

    const context = element[ComponentContext__symbol];

    if (!context) {
      throw TypeError(`No component context found in ${element}`);
    }

    return context;
  }

  /**
   * Component content root.
   *
   * This is a shorthand for requesting a {@link ContentRoot content root} from component context.
   */
  get contentRoot(): any {
    return this.get(ContentRoot);
  }

  /**
   * Builds an `OnEvent` sender of component readiness event.
   *
   * The component is constructed shortly after custom element. So the component may not exist when requested
   * e.g. inside component constructor or {@link DefinitionContext.whenComponent component instantiation event}
   * receiver. The registered receiver will be notified when the component is constructed.
   *
   * If the component is constructed already, the receiver will be notified immediately.
   *
   * @returns An `OnEvent` sender of this context upon component readiness.
   */
  abstract whenReady(): OnEvent<[this]>;

  /**
   * Registers a receiver of component readiness event.
   *
   * The component is constructed shortly after custom element. So the component may not exist when requested
   * e.g. inside component constructor or {@link DefinitionContext.whenComponent component instantiation event}
   * receiver. The registered receiver will be notified when the component is constructed.
   *
   * @param receiver  Target receiver of this component upon component readiness.
   *
   * @returns Component readiness event supply.
   */
  abstract whenReady(receiver: EventReceiver<[this]>): EventSupply;

  /**
   * Builds an `OnEvent` sender of custom element connection events.
   *
   * The registered receiver is called when custom element is connected, i.e. its `connectedCallback()` method is
   * called. If component is connected already the receiver is called immediately.
   *
   * @returns An `OnEvent` sender of this component context when connected.
   */
  abstract whenConnected(): OnEvent<[this]>;

  /**
   * Registers a receiver of custom element connection events.
   *
   * The registered receiver is called when custom element is connected, i.e. its `connectedCallback()` method is
   * called. If component is connected already the receiver is called immediately.
   *
   * @param receiver  Target receiver of this component context when connected.
   *
   * @returns Custom element connection events supply.
   */
  abstract whenConnected(receiver: EventReceiver<[this]>): EventSupply;

  /**
   * Returns a `super` property value inherited from custom element parent.
   *
   * @param key  Target property key.
   */
  abstract elementSuper(key: PropertyKey): any;

  /**
   * Returns a DOM event producer for the given event type.
   *
   * This is a shorthand for invoking a component event producer function available under
   * `[ComponentEventProducer.key]` key.
   *
   * @param type  An event type to listen for.
   *
   * @returns A producer of DOM event events of the given type.
   */
  on<E extends Event>(type: string): OnDomEvent<E> {
    return this.get(ComponentEventDispatcher__key).on(type);
  }

  /**
   * Dispatches an event to component element.
   *
   * This is a shorthand for invoking a component {@link ComponentEventDispatcher event dispatcher}.
   *
   * @param event  An event to dispatch.
   */
  dispatchEvent(event: Event): void {
    this.get(ComponentEventDispatcher__key).dispatch(event);
  }

  /**
   * Destroys the component.
   *
   * Removes element from the DOM tree. I.e. disconnects custom element first.
   *
   * After this method call the component should no longer be used.
   *
   * Note that component destruction is virtual. It is up to developer to decide when component is no longer needed.
   * However the component is destroyed automatically once disconnected, i.e. when custom element's
   * `disconnectedCallback()` method is called.
   *
   * @param reason  Optional reason of destruction.
   */
  abstract destroy(reason?: any): void;

}

/**
 * @internal
 */
function updateComponentState<V>(this: ComponentContext<any>, key: StatePath, newValue: V, oldValue: V): void {
  this.get(StateUpdater)(key, newValue, oldValue);
}
