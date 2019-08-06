/**
 * @module @wesib/wesib
 */
import { ContextRequest, ContextTarget } from 'context-values';
import { OnDomEvent } from 'fun-events';
import { ComponentContext } from './component-context';
import { ComponentEventDispatcher__key } from './component-event.key.impl';

/**
 * Component event.
 *
 * Events of this type are thrown by various services to inform on component status changes.
 *
 * It is illegal to dispatch such events for elements not bound to components. It is reasonable to dispatch events
 * using [[ComponentEventDispatcher]] available in component context.
 *
 * The following event types supported:
 * - `wesib:component` is thrown when component is bound to element. I.e. when HTML element is upgraded to custom one
 *   defined by component, or component is bound to the element. This event bubbles and is not cancelable.
 *
 * @category Core
 * @event ComponentEvent#wesib:component
 */
export class ComponentEvent extends Event {

  /**
   * Constructs component event.
   *
   * @param type  Event type.
   * @param eventInitDict  Event initialization dictionary.
   */
  constructor(type: string, eventInitDict?: EventInit) {
    super(type, eventInitDict);
  }

  /**
   * Target component context.
   */
  get context(): ComponentContext {
    return ComponentContext.of(this.target);
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
   * @param context  Target component context.
   * @param event  An event to dispatch.
   *
   * @returns `true` if either event's `cancelable` attribute value is `false` or its `preventDefault()` method was not
   * invoked, or `false` otherwise.
   */
  dispatch(context: ComponentContext, event: Event): boolean;

  /**
   * Returns a registrar of DOM event listeners for the given DOM event type.
   *
   * @param context  Target component context.
   * @param type  An event type to listen for.
   *
   * @returns A producer of DOM event events of the given type.
   */
  on<E extends Event>(context: ComponentContext, type: string): OnDomEvent<E>;

}

/**
 * A key of bootstrap context value containing component event dispatcher.
 *
 * @category Core
 */
export const ComponentEventDispatcher:
    ContextTarget<ComponentEventDispatcher> & ContextRequest<ComponentEventDispatcher> =
    /*#__PURE__*/ ComponentEventDispatcher__key;
