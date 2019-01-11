import { ComponentContext } from './component-context';

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
