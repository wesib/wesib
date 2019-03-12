import { ContextKey } from 'context-values';
import { OnDomEvent } from 'fun-events';
import { ComponentContext } from './component-context';
import { ComponentEventDispatcher__key } from './component-event.key';

/**
 * Component event.
 *
 * Events of this type are thrown by various services to inform on component status changes.
 *
 * It is illegal to dispatch such events for elements not bound to components. It is reasonable to dispatch events
 * using `ComponentEventDispatcher` available in component context.
 *
 * The following event types supported:
 * - `wesib:component` is thrown when component is bound to element. I.e. when HTML element is upgraded to custom one
 *   defined by component, or component is bound to the element. This event bubbles and is not cancelable.
 */
export class ComponentEvent extends Event {

  /**
   * Constructs component event.
   *
   * @param type Event type.
   * @param eventInitDict Event initialization dictionary.
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
 * @param context A context of component to dispatch an `event` for.
 * @param event An event to dispatch.
 */
export interface ComponentEventDispatcher {

  /**
   * Dispatches the DOM event for the given component.
   *
   * @param context Target component context.
   * @param event An event to dispatch.
   */
  dispatch(context: ComponentContext<any>, event: Event): void;

  /**
   * Returns a registrar of DOM event listeners for the given DOM event type.
   *
   * @param context Target component context.
   * @param type An event type to listen for.
   *
   * @returns A producer of DOM event events of the given type.
   */
  on<E extends Event>(context: ComponentContext<any>, type: string): OnDomEvent<E>;

}

export const ComponentEventDispatcher = {

  /**
   * A key of bootstrap context value containing component event dispatcher.
   */
  get key(): ContextKey<ComponentEventDispatcher> {
    return ComponentEventDispatcher__key;
  }

};
