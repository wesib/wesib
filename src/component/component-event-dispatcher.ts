import { DomEventDispatcher, OnDomEvent } from '@frontmeans/dom-events';
import { CxEntry, cxSingle } from '@proc7ts/context-values';
import { ComponentContext } from './component-context';

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
 * Component context entry containing component event dispatcher.
 *
 * @category Core
 */
export const ComponentEventDispatcher: CxEntry<ComponentEventDispatcher> = {
  perContext: /*#__PURE__*/ cxSingle({
    byDefault(values) {
      const context = values.get(ComponentContext);
      const dispatcher = new DomEventDispatcher(context.element as EventTarget);

      dispatcher.supply.needs(context);

      return {
        dispatch(event: Event): boolean {
          return dispatcher.dispatch(event);
        },
        on<TEvent extends Event>(type: string): OnDomEvent<TEvent> {
          return dispatcher.on(type);
        },
      };
    },
  }),
  toString: () => '[ComponentEventDispatcher]',
};
