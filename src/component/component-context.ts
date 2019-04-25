import { ContextKey, ContextValues } from 'context-values';
import { OnDomEvent, OnEvent, StatePath } from 'fun-events';
import { BootstrapContext__key } from '../kit/bootstrap-context.key';
import { ComponentClass } from './component-class';
import { ComponentContext__key } from './component-context.key';
import { ComponentEventDispatcher__key } from './component-event.key';
import { ComponentMount } from './component-mount';
import { ContentRoot } from './content-root';
import { StateUpdater } from './state-updater';

/**
 * A key of a custom element and component properties containing a reference to component context.
 */
export const ComponentContext__symbol = /*#__PURE__*/ Symbol('component-context');

/**
 * Component context.
 *
 * Passed to component constructor as its only parameter.
 *
 * Extends `ContextValues` interface. The values are provided by corresponding providers registered with
 * `BootstrapContext.perComponent()` method.
 *
 * @param <T> A type of component.
 */
export abstract class ComponentContext<T extends object = object> extends ContextValues {

  /**
   * A key of component context value containing the component context instance itself.
   */
  static get key(): ContextKey<ComponentContext<any>> {
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
   * It is an error accessing this property before the component is created, e.g. from inside of `ComponentListener`
   * or component constructor. In these cases you may wish to add a `whenReady()` callback.
   */
  abstract readonly component: T;

  /**
   * Component mount.
   *
   * This is defined when component is mounted to arbitrary element by `ComponentFactory.mountTo()`. Ot is `undefined`
   * for components created in standard way.
   */
  abstract readonly mount: ComponentMount<T> | undefined;

  /**
   * Whether the custom element is connected.
   *
   * This becomes `true` right before `onConnect` is called, and becomes false right before `onDisconnect` is called.
   */
  abstract readonly connected: boolean;

  /**
   * Registers custom element connection listener.
   *
   * This listener is called when custom element is connected, i.e. its `connectedCallback()` method is called.
   *
   * @param listener A listener to notify on element connection.
   *
   * @return An event interest instance.
   */
  abstract readonly onConnect: OnEvent<[ComponentContext<T>]>;

  /**
   * Registers custom element disconnection listener.
   *
   * This listener will be called when custom element is disconnected, i.e. its `disconnectedCallback()` method is
   * called.
   *
   * @param listener A listener to notify on element disconnection.
   *
   * @return An event interest instance.
   */
  abstract readonly onDisconnect: OnEvent<[ComponentContext<T>]>;

  /**
   * Updates component's state.
   *
   * This is a shorthand for invoking a component state update function available under `[StateUpdater.key]` key.
   *
   * Note that state update has no effect unless `StateSupport` feature is enabled or `[StateUpdater.key]` context value
   * is provided by other means.
   *
   * @param <V> A type of changed value.
   * @param key Changed value key.
   * @param newValue New value.
   * @param oldValue Previous value.
   */
  readonly updateState: StateUpdater = (<V>(key: StatePath, newValue: V, oldValue: V) => {
    this.get(StateUpdater)(key, newValue, oldValue);
  });

  /**
   * Extracts component context from its custom element or from component itself.
   *
   * @param element Custom element instance created for the component or the component itself.
   *
   * @return Component context reference stored under `[ComponentContext__symbol]` key.
   *
   * @throws TypeError When the given `element` does not contain component context reference.
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
   * This is a shorthand for requesting content root instance available under `[ContentRoot.key]` key.
   */
  get contentRoot(): ParentNode {
    return this.get(ContentRoot);
  }

  /**
   * Registers component readiness callback.
   *
   * The component is constructed shortly after custom element. So the component may not exist when requested
   * e.g. inside component constructor or inside `ComponentListener`. The registered callback will be notified when
   * the component is constructed.
   *
   * If the component is constructed already, the callback will be notified immediately.
   *
   * @param callback A callback to notify on component construction.
   */
  abstract whenReady(callback: (this: this, component: T) => void): void;

  /**
   * Returns a `super` property value inherited from custom element parent.
   *
   * @param key Target property key.
   */
  abstract elementSuper(key: PropertyKey): any;

  /**
   * Returns a DOM event producer for the given event type.
   *
   * This is a shorthand for invoking a component event producer function available under
   * `[ComponentEventProducer.key]` key.
   *
   * @param type An event type to listen for.
   *
   * @returns A producer of DOM event events of the given type.
   */
  on<E extends Event>(type: string): OnDomEvent<E> {
    return this.get(ComponentEventDispatcher__key).on(this, type);
  }

  /**
   * Dispatches an event to component element.
   *
   * This is a shorthand for invoking a component event dispatcher function available under
   * `[ComponentEventDispatcher.key]` key.
   *
   * @param event An event to dispatch.
   */
  dispatchEvent(event: Event): void {
    this.get(BootstrapContext__key).get(ComponentEventDispatcher__key).dispatch(this, event);
  }

}
