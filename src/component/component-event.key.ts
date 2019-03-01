import { ContextValues, SingleContextKey } from 'context-values';
import { DomEventDispatcher } from 'fun-events';
import { ComponentContext } from './component-context';
import { ComponentContext__key } from './component-context.key';
import { ComponentEventDispatcher, ComponentEventProducer } from './component-event';

/**
 * @internal
 */
export const ComponentEventDispatcher__key = /*#__PURE__*/ new SingleContextKey<ComponentEventDispatcher>(
    'component-event-dispatcher',
    () => (context: ComponentContext<any>, event: Event) => context.element.dispatchEvent(event));

/**
 * @internal
 */
export const ComponentEventProducer__key = /*#__PURE__*/ new SingleContextKey<ComponentEventProducer>(
    'component-event-producer',
    (values: ContextValues) => {

      const dispatcher = new DomEventDispatcher(values.get(ComponentContext__key).element);

      return <E extends Event>(type: string) => dispatcher.on(type);
    });
