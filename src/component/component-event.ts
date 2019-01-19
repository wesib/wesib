import { ContextKey } from 'context-values';
import { ComponentContext } from './component-context';
import { componentEventDispatcherKey } from './component-event.key';

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
   * Target component context.
   */
  get context(): ComponentContext {
    return ComponentContext.of(this.target);
  }

  /**
   * Constructs component event.
   *
   * @param type
   * @param eventInitDict
   */
  constructor(type: string, eventInitDict?: EventInit) {
    super(type, eventInitDict);
  }

}

/**
 * Component event dispatcher function is used to dispatch component events.
 *
 * It is available in bootstrap context context.
 *
 * @param context A context of component to dispatch an `event` for.
 * @param event An event to dispatch.
 */
export type ComponentEventDispatcher = (context: ComponentContext<any>, event: Event) => void;

export namespace ComponentEventDispatcher {

  /**
   * A key of bootstrap context value containing component event dispatcher.
   */
  export const key: ContextKey<ComponentEventDispatcher> = componentEventDispatcherKey;

}
