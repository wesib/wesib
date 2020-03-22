import { SingleContextKey } from '@proc7ts/context-values';
import { eventSupplyOf } from '@proc7ts/fun-events';
import { DomEventDispatcher, OnDomEvent } from '@proc7ts/fun-events/dom';
import { ComponentContext__key } from './component-context.key.impl';
import { ComponentEventDispatcher } from './component-event';

/**
 * @internal
 */
export const ComponentEventDispatcher__key = (/*#__PURE__*/ new SingleContextKey<ComponentEventDispatcher>(
    'component-event-dispatcher',
    {
      byDefault(values) {

        const context = values.get(ComponentContext__key);
        const dispatcher = new DomEventDispatcher(context.element);

        eventSupplyOf(dispatcher).needs(context);

        return {
          dispatch(event: Event): boolean {
            return dispatcher.dispatch(event);
          },
          on<E extends Event>(type: string): OnDomEvent<E> {
            return dispatcher.on(type);
          },
        };
      },
    },
));
