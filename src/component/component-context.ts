import { OnDomEvent } from '@frontmeans/dom-events';
import { cxSingle, CxValues } from '@proc7ts/context-values';
import { AfterEvent, OnEvent } from '@proc7ts/fun-events';
import { Supply, SupplyPeer } from '@proc7ts/supply';
import { ContentRoot } from './content-root';
import { ComponentClass } from './definition';
import { StateUpdater } from './state-updater';

/**
 * A key of component instance method returning its component context.
 *
 * @category Core
 */
export const ComponentContext__symbol = (/*#__PURE__*/ Symbol('ComponentContext'));

/**
 * Component context.
 *
 * Passed to component constructor as its only parameter.
 *
 * Extends `ContextValues` interface. The values are provided by corresponding providers registered with
 * {@link BootstrapSetup.perComponent} and {@link DefinitionSetup.perComponent} methods.
 *
 * @category Core
 * @typeParam T - A type of component.
 */
export interface ComponentContext<T extends object = any> extends CxValues, SupplyPeer {

  /**
   * Component class constructor.
   */
  readonly componentType: ComponentClass<T>;

  /**
   * Custom element constructed for the component according to its type.
   *
   * E.g. `HTMLElement` instance.
   */
  readonly element: any;

  /**
   * A component instance.
   *
   * It is an error accessing this property before the component is created, e.g. from inside of component constructor
   * or {@link DefinitionContext.whenComponent component instantiation event} receiver. A {@link whenReady} callback
   * can be used to work this around.
   */
  readonly component: ComponentInstance<T>;

  /**
   * Whether the component is {@link DefinitionContext.mountTo mounted} to element.
   */
  readonly mounted: boolean;

  /**
   * Whether the component is ready.
   *
   * Set to `true` when {@link component} is available.
   */
  readonly ready: boolean;

  /**
   * An `OnEvent` sender of component readiness event.
   *
   * The component is constructed shortly after context. So the component may not exist when requested inside component
   * constructor or {@link DefinitionContext.whenComponent component instantiation event} receiver. The registered
   * receiver will be notified when the component is constructed.
   *
   * If the component is constructed already, the receiver will be notified immediately.
   */
  readonly onceReady: OnEvent<[this]>;

  /**
   * An `OnEvent` sender of single component readiness event.
   *
   * The component is constructed shortly after context. So the component may not exist when requested inside component
   * constructor or {@link DefinitionContext.whenComponent component instantiation event} receiver. The registered
   * receiver will be notified when the component is constructed.
   *
   * If the component is constructed already, the receiver will be notified immediately.
   *
   * In contrast to {@link onceReady}, cuts off the event supply after sending the first event.
   */
  readonly whenReady: OnEvent<[this]>;

  /**
   * Whether the component is settled.
   *
   * Component settlement happens:
   * - when {@link settle} method is called,
   * - when component is {@link DefinitionContext.mountTo mounted} to element, or
   * - when component's element is {@link connected}.
   *
   * It is guaranteed that component settlement won't happen inside custom element's constructor. So the settlement
   * event may be used e.g. to start DOM manipulations, as it is prohibited inside custom element constructor.
   *
   * This becomes `true` right before {@link whenSettled} event is sent.
   */
  readonly settled: boolean;

  /**
   * An `OnEvent` sender of component settlement event.
   *
   * The registered receiver is called when component is {@link settled}. If settled already the receiver is called
   * immediately.
   */
  readonly onceSettled: OnEvent<[this]>;

  /**
   * An `OnEvent` sender of single component settlement event.
   *
   * The registered receiver is called when component is {@link settled}. If settled already the receiver is called
   * immediately.
   *
   * In contrast to {@link onceSettled}, cuts off the event supply after sending the first event.
   */
  readonly whenSettled: OnEvent<[this]>;

  /**
   * Whether the component's element is connected.
   *
   * This becomes `true` right before {@link whenConnected} event is sent.
   */
  readonly connected: boolean;

  /**
   * An `OnEvent` sender of component's element connection event.
   *
   * The registered receiver is called when component's element is connected. E.g. when custom element's
   * `connectedCallback()` method is called.
   *
   * If connected already the receiver is called immediately.
   */
  readonly onceConnected: OnEvent<[this]>;

  /**
   * An `OnEvent` sender of single component's element connection event.
   *
   * The registered receiver is called when component's element is connected. E.g. when custom element's
   * `connectedCallback()` method is called.
   *
   * If connected already the receiver is called immediately.
   *
   * In contrast to {@link onceConnected}, cuts off the event supply after sending the first event.
   */
  readonly whenConnected: OnEvent<[this]>;

  /**
   * An `AfterEvent` keeper of component status.
   *
   * Sends this context instance each time the component status changes.
   */
  readonly readStatus: AfterEvent<[this]>;

  /**
   * An event supply that disposes component and its context when cut off.
   *
   * Unmounts the {@link mounted} component.
   *
   * For custom element the component may be reconstructed when element is connected to document or settled again.
   */
  readonly supply: Supply;

  /**
   * Updates component's state.
   *
   * This is a shorthand for invoking a component {@link StateUpdater state updater} .
   *
   * @typeParam TValue - A type of changed value.
   * @param key - Changed value key.
   * @param newValue - New value.
   * @param oldValue - Previous value.
   */
  readonly updateState: StateUpdater;

  /**
   * Component content root.
   *
   * This is a shorthand for requesting a {@link ContentRoot content root} from component context.
   */
  readonly contentRoot: ContentRoot;

  /**
   * Settles component.
   *
   * Calling this method has no effect if component is {@link settled} already, when component is not
   * {@link whenReady ready} yet, or custom element's constructor is not exited.
   *
   * Calling this method may trigger DOM manipulations (the latter is prohibited inside custom element's constructor).
   * This may be desired for rendering optimizations. E.g. to render element's content _before_ adding it to document.
   *
   * This method is called automatically when {@link DefinitionContext.mountTo mounting} component to element.
   */
  settle(): void;

  /**
   * Returns DOM event producer for the given event type.
   *
   * Retrieves an event producer from {@link ComponentEventDispatcher component event dispatcher} available in this
   * context.
   *
   * @typeParam TEvent - DOM event type.
   * @param type - An event type to listen for.
   *
   * @returns A producer of DOM event events of the given type.
   */
  on<TEvent extends Event>(type: string): OnDomEvent<TEvent>;

  /**
   * Dispatches an event to component element.
   *
   * Dispatches using a {@link ComponentEventDispatcher component event dispatcher} available in this context.
   *
   * @param event - An event to dispatch.
   */
  dispatchEvent(event: Event): void;

}

/**
 * Component context entry containing the context itself.
 *
 * @category Core
 */
export const ComponentContext = {

  perContext: (/*#__PURE__*/ cxSingle<ComponentContext>()),

  /**
   * Extracts component context from the given component instance.
   *
   * @param component - Target component instance.
   *
   * @return Component context reference returned by {@link ComponentContext__symbol} method.
   *
   * @throws TypeError  When the given `component` does not contain component context reference.
   */
  of<T extends object>(this: void, component: ComponentInstance<T>): ComponentContext<T> {
    if (typeof component[ComponentContext__symbol] !== 'function') {
      throw new TypeError(`No component context found in ${String(component)}`);
    }

    return component[ComponentContext__symbol]!();
  },

  toString: () => '[ComponentContext]',

};

/**
 * A component instance.
 *
 * @category Core
 */
export type ComponentInstance<T extends object = any> = T & {

  /**
   * @returns Component context.
   */
  [ComponentContext__symbol]?(): ComponentContext<T>;

};
