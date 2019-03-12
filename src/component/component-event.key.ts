import { SingleContextKey } from 'context-values';
import { DomEventDispatcher, OnDomEvent } from 'fun-events';
import { ComponentContext } from './component-context';
import { ComponentEventDispatcher } from './component-event';

/**
 * @internal
 */
export const ComponentEventDispatcher__key = /*#__PURE__*/ new SingleContextKey<ComponentEventDispatcher>(
    'component-event-dispatcher',
    () => ({
      dispatch(context: ComponentContext<any>, event: Event) {
        context.element.dispatchEvent(event);
      },
      on<E extends Event>(context: ComponentContext<any>, type: string): OnDomEvent<E> {

        const dispatcher = new DomEventDispatcher(context.element);

        return dispatcher.on(type);
      },
    }));
