/**
 * Component value provider.
 *
 * It is responsible for constructing the values associated with particular key for each component.
 *
 * This function is called at most once per component, unless it returns `null`/`undefined`. In the latter case
 * it may be called again later.
 *
 * @param <V> The type of associated value.
 * @param context Target component context.
 *
 * @return Either constructed value, or `null`/`undefined` if the value can not be constructed.
 */
import { ComponentContext } from './component-context';

export type ComponentValueProvider<V> = <E extends HTMLElement>(context: ComponentContext<E>) => V | null | undefined;
