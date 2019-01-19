import { ContextValues, SingleContextKey } from 'context-values';
import { DomEventDispatcher } from 'fun-events';
import { ComponentContext } from './component-context';
import { componentContextKey } from './component-context.key';
import { ComponentEventDispatcher, ComponentEventProducer } from './component-event';

/**
 * @internal
 */
export const componentEventDispatcherKey = new SingleContextKey<ComponentEventDispatcher>(
    'component-event-dispatcher',
    () => (context: ComponentContext<any>, event: Event) => context.element.dispatchEvent(event));

/**
 * @internal
 */
export const componentEventProducerKey = new SingleContextKey<ComponentEventProducer>(
    'component-event-producer',
    (values: ContextValues) => {

      const dispatcher = new DomEventDispatcher(values.get(componentContextKey).element);

      return <E extends Event>(type: string) => dispatcher.on(type);
    });
