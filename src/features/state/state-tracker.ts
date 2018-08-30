import { ComponentValueKey } from '../../component';
import { EventProducer } from '../../events';

/**
 * Web component state tracker.
 *
 * It is available in component context under `StateTracker.key` value key when `StateSupport` feature is enabled.
 */
export interface StateTracker {

  /**
   * Registers component state updates listener.
   *
   * This listener will be called `refreshState()` is called.
   *
   * @param listener A listener to notify on state updates.
   *
   * @return An event interest instance.
   */
  readonly onStateUpdate: EventProducer<() => void>;

  /**
   * Refreshes the component state.
   *
   * All listeners registered with `onStatusUpdate()` will be notified on this update.
   *
   * This method is also called by the function available under `ComponentValueKey.stateRefresh` key. This is
   * preferred way to call it. As the caller won't depend on `StateSupport` feature then.
   */
  refreshState(): void;

}

export namespace StateTracker {

  /**
   * A `StateTracker` component value key.
   */
  export const key = new ComponentValueKey<StateTracker>('state-tracker');

}
