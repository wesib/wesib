import { EventProducer } from '../../common';
import { ComponentValueKey, StateRefreshFn } from '../../component';

/**
 * Web component state tracker.
 *
 * It is available in component context under `StateTracker.key` value key when `StateSupport` feature is enabled.
 */
export interface StateTracker {

  /**
   * Registers component state updates listener.
   *
   * This listener will be called when `refreshState()` is called.
   *
   * @param listener A listener to notify on state updates.
   *
   * @return An event interest instance.
   */
  readonly onStateUpdate: EventProducer<StateRefreshFn>;

  /**
   * Refreshes the component state.
   *
   * All listeners registered with `onStatusUpdate()` will be notified on this update.
   *
   * This method is also called by the function available under `ComponentValueKey.stateRefresh` key. This is
   * preferred way to call it, as the caller won't depend on `StateSupport` feature then.
   *
   * @param <V> A type of changed value.
   * @param key Changed value key.
   * @param newValue New value.
   * @param oldValue Previous value.
   */
  refreshState<V>(key: PropertyKey, newValue: V, oldValue: V): void;

}

export namespace StateTracker {

  /**
   * A `StateTracker` component value key.
   */
  export const key = new ComponentValueKey<StateTracker>('state-tracker');

}
