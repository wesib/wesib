import { OnDomEvent } from '@frontmeans/dom-events';
import { SingleContextRef } from '@proc7ts/context-values';
import { ComponentEventDispatcher__key } from './component-event-dispatcher.key.impl';

/**
 * Component event dispatcher is used to listen for and dispatch component events.
 *
 * It is available in bootstrap context context.
 *
 * By default treats a component element as event target.
 *
 * @category Core
 */
export interface ComponentEventDispatcher {

  /**
   * Dispatches the DOM event for the given component.
   *
   * @param event - An event to dispatch.
   *
   * @returns `true` if either event's `cancelable` attribute value is `false` or its `preventDefault()` method was not
   * invoked, or `false` otherwise.
   */
  dispatch(event: Event): boolean;

  /**
   * Returns an `OnDomEvent` sender of DOM events of the given type.
   *
   * @typeParam TEvent - DOM event type.
   * @param type - An event type to listen for.
   *
   * @returns A producer of DOM event events of the given type.
   */
  on<TEvent extends Event>(type: string): OnDomEvent<TEvent>;

}

/**
 * A key of component context value containing component event dispatcher.
 *
 * @category Core
 */
export const ComponentEventDispatcher: SingleContextRef<ComponentEventDispatcher> = ComponentEventDispatcher__key;
