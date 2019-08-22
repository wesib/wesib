/**
 * @module @wesib/wesib
 */
import { noop } from 'call-thru';
import { FnContextKey, FnContextRef } from 'context-values';
import { StatePath } from 'fun-events';

/**
 * Component state updater function.
 *
 * @category Core
 */
export type StateUpdater =
/**
 * @typeparam V  Updated value type
 * @param path  Updated state node path.
 * @param newValue  New value.
 * @param oldValue  Replaced value.
 */
    <V>(this: void, path: StatePath, newValue: V, oldValue: V) => void;

/**
 * A key of component context value containing a component state updates receiver function.
 *
 * Features are calling this function by default when component state changes, e.g. attribute value or DOM property
 * modified.
 *
 * Note that this value is not provided, unless the `StateSupport` feature is enabled.
 *
 * @category Core
 */
export const StateUpdater: FnContextRef<Parameters<StateUpdater>> = /*#__PURE__*/ new FnContextKey(
    'state-updater',
    {
      byDefault: noop,
    },
);
