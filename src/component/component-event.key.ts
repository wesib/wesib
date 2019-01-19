import { ContextKey, SingleContextKey } from 'context-values';
import { ComponentContext } from './component-context';
import { ComponentEventDispatcher } from './component-event';

/**
 * @internal
 */
export const componentEventDispatcherKey: ContextKey<ComponentEventDispatcher> = new SingleContextKey(
    'component-event-dispatcher',
    () => (context: ComponentContext<any>, event: Event) => context.element.dispatchEvent(event));
