/**
 * @module @wesib/wesib
 */
import { ContextKey, ContextKey__symbol, ContextValues } from 'context-values';
import { OnDomEvent, OnEvent, StatePath } from 'fun-events';
import { BootstrapContext__key } from '../boot/bootstrap-context.key.impl';
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
export const ComponentContext__symbol = /*#__PURE__*/ Symbol('component-context');

/**
 * Component context.
 *
 * Passed to component constructor as its only parameter.
 *
 * Extends `ContextValues` interface. The values are provided by corresponding providers registered with
 * [[BootstrapContext.perComponent]] method.
 *
 * @category Core
 * @typeparam T  A type of component.
 */
export abstract class ComponentContext<T extends object = any> extends ContextValues {

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
   * or {@link DefinitionContext.onComponent component construction event} receiver. In these cases you may wish to
   * add a [[whenReady]] callback.
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
   * Registers custom element connection listener.
   *
   * This listener is called when custom element is connected, i.e. its `connectedCallback()` method is called.
   * If component is connected already the listener is called immediately.
   *
   * @param listener  A listener to notify on element connection.
   *
   * @returns An event interest instance.
   */
  abstract readonly whenOn: OnEvent<[]>;

  /**
   * Registers custom element disconnection listener.
   *
   * This listener is called when custom element is disconnected, i.e. its `disconnectedCallback()` method is called.
   * If component is ready but disconnected, the listener is called immediately.
   *
   * @param listener  A listener to notify on element disconnection.
   *
   * @returns An event interest instance.
   */
  abstract readonly whenOff: OnEvent<[]>;

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
  get contentRoot(): ContentRoot {
    return this.get(ContentRoot);
  }

  /**
   * Registers component readiness callback.
   *
   * The component is constructed shortly after custom element. So the component may not exist when requested
   * e.g. inside component constructor or {@link DefinitionContext.onComponent component construction event} receiver.
   * The registered callback will be notified when the component is constructed.
   *
   * If the component is constructed already, the callback will be notified immediately.
   *
   * @param callback  A callback to notify on component construction.
   */
  abstract whenReady(callback: (this: void, component: T) => void): void;

  /**
   * Registers component destruction callback.
   *
   * This callback is notified when [[destroy]] method is called. If the component is destroyed already the callback
   * is notified immediately.
   *
   * Multiple callbacks will be called in the order reverse to their registration order.
   *
   * @param callback  A callback to notify on component destruction.
   */
  abstract whenDestroyed(callback: (this: void, reason: any) => void): void;

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
    return this.get(ComponentEventDispatcher__key).on(this, type);
  }

  /**
   * Dispatches an event to component element.
   *
   * This is a shorthand for invoking a component {@link ComponentEventDispatcher event dispatcher}.
   *
   * @param event  An event to dispatch.
   */
  dispatchEvent(event: Event): void {
    this.get(BootstrapContext__key).get(ComponentEventDispatcher__key).dispatch(this, event);
  }

  /**
   * Destroys the component.
   *
   * Removes element from the DOM tree. I.e. disconnects custom element first.
   *
   * After this method call the component should no longer be used.
   *
   * Note that component destruction is virtual. It is up to developer to decide when component is no longer needed.
   *
   * @param reason  Optional reason of destruction.
   */
  abstract destroy(reason?: any): void;

}

function updateComponentState<V>(this: ComponentContext<any>, key: StatePath, newValue: V, oldValue: V) {
  this.get(StateUpdater)(key, newValue, oldValue);
}
