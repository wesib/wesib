import { SingleContextKey } from 'context-values';
import { DomEventDispatcher, OnDomEvent } from 'fun-events';
import { ComponentContext } from './component-context';
import { ComponentEventDispatcher } from './component-event';

/**
 * @internal
 */
export const ComponentEventDispatcher__key = /*#__PURE__*/ new SingleContextKey<ComponentEventDispatcher>(
    'component-event-dispatcher',
    {
      byDefault() {
        return {
          dispatch(context: ComponentContext, event: Event): boolean {
            return context.element.dispatchEvent(event);
          },
          on<E extends Event>(context: ComponentContext, type: string): OnDomEvent<E> {

            const dispatcher = new DomEventDispatcher(context.element);

            return dispatcher.on(type);
          },
        };
      },
    },
);
