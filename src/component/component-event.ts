/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { OnDomEvent } from '@frontmeans/dom-events';
import { SingleContextRef } from '@proc7ts/context-values';
import { ComponentContext, ComponentContextHolder } from './component-context';
import { ComponentEventDispatcher__key } from './component-event.key.impl';

/**
 * Component event.
 *
 * Events of this type are thrown by various services to inform on component status changes.
 *
 * It is illegal to dispatch such events for elements not bound to components. It is reasonable to dispatch events
 * using {@link ComponentEventDispatcher} available in component context.
 *
 * The following event types supported:
 * - `wesib:component` is dispatched when component is bound to element. I.e. when HTML element is upgraded to custom
 *   one defined by component, or component is mounted to element. The event is dispatched when component is connected
 *   for the first time. I.e. when element is added to the document.
 *   This event bubbles and is not cancelable.
 *
 * @category Core
 * @event ComponentEvent#wesib:component
 */
export class ComponentEvent extends Event {

  /**
   * Target component context.
   */
  get context(): ComponentContext {
    return ComponentContext.of(this.target as ComponentContextHolder);
  }

}

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
