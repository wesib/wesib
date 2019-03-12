import { noop } from 'call-thru';
import { ContextKey, SingleContextKey } from 'context-values';
import { StateUpdateReceiver } from 'fun-events';

/**
 * Component state updater function.
 */
export type StateUpdater = StateUpdateReceiver;

const StateUpdater__key = /*#__PURE__*/ new SingleContextKey('state-updater', () => noop);

export const StateUpdater = {

  /**
   * A key of component context value containing a component state updates consumer function.
   *
   * Features are calling this function by default when component state changes, e.g. attribute value or DOM property
   * modified.
   *
   * Note that this value is not provided, unless the `StateSupport` feature is enabled.
   */
  get key(): ContextKey<StateUpdater> {
    return StateUpdater__key;
  }

};
