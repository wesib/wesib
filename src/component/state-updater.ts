/**
 * @module @wesib/wesib
 */
import { noop } from 'call-thru';
import { ContextRequest, ContextTarget, SingleContextKey } from 'context-values';
import { StatePath } from 'fun-events';

/**
 * Component state updater function.
 */
export type StateUpdater = <V>(this: void, path: StatePath, newValue: V, oldValue: V) => void;

/**
 * A key of component context value containing a component state updates receiver function.
 *
 * Features are calling this function by default when component state changes, e.g. attribute value or DOM property
 * modified.
 *
 * Note that this value is not provided, unless the `StateSupport` feature is enabled.
 */
export const StateUpdater: ContextTarget<StateUpdater> & ContextRequest<StateUpdater> =
    /*#__PURE__*/ new SingleContextKey('state-updater', () => noop);
