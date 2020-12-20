import { DomEventDispatcher, OnDomEvent } from '@frontmeans/dom-events';
import { SingleContextKey } from '@proc7ts/context-values';
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
    },
));
