/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { noop } from '@proc7ts/call-thru';
import { ContextValueSlot } from '@proc7ts/context-values';
import { ContextUpKey, ContextUpRef } from '@proc7ts/context-values/updatable';
import { AfterEvent, afterThe, EventKeeper, nextAfterEvent, statePath, StatePath } from '@proc7ts/fun-events';
import { mergeFunctions } from '../common';

/**
 * Component state updater signature.
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

export namespace StateUpdater {

  /**
   * Normalized component state updater signature.
   *
   * Accepts normalized state path.
   */
  export type Normalized =
  /**
   * @typeparam V  Updated value type
   * @param path  Normalized path of updated state node.
   * @param newValue  New value.
   * @param oldValue  Replaced value.
   */
      <V>(this: void, path: StatePath.Normalized, newValue: V, oldValue: V) => void;

}

/**
 * @internal
 */
class StateUpdaterKey extends ContextUpKey<StateUpdater, StateUpdater.Normalized> {

  readonly upKey: ContextUpKey.UpKey<StateUpdater, StateUpdater.Normalized>;

  constructor() {
    super('state-updater');
    this.upKey = this.createUpKey(
        slot => slot.insert(slot.seed.keepThru(
            (...fns) => {
              if (fns.length) {

                const combined: StateUpdater.Normalized = fns.reduce(
                    (prev, fn) => mergeFunctions(fn, prev),
                    noop,
                );

                return (path, newValue, oldValue) => combined(statePath(path), newValue, oldValue);
              }
              if (slot.hasFallback && slot.or) {
                return nextAfterEvent(slot.or);
              }
              return noop;
            },
        )),
    );
  }

  grow(
      slot: ContextValueSlot<
          StateUpdater,
          EventKeeper<StateUpdater.Normalized[]> | StateUpdater.Normalized,
          AfterEvent<StateUpdater.Normalized[]>>,
  ): void {

    let delegated: StateUpdater;

    slot.context.get(
        this.upKey,
        slot.hasFallback ? { or: slot.or != null ? afterThe(slot.or) : slot.or } : undefined,
    )!.to(
        fn => delegated = fn,
    ).whenOff(
        () => delegated = noop,
    );

    slot.insert((path, newValue, oldValue) => delegated(path, newValue, oldValue));
  }

}

/**
 * A key of component context value containing a component {@link StateUpdater state updater} function.
 *
 * Features are calling this function by default when component state changes, e.g. attribute value or DOM property
 * modified.
 *
 * Note that this value is not provided, unless a {@link StateSupport state support} enabled.
 *
 * When multiple state updaters provided, they all will be called on each state update, in reverse order.
 *
 * Does nothing after component destruction.
 *
 * @category Core
 */
export const StateUpdater: ContextUpRef<StateUpdater, StateUpdater.Normalized> = (/*#__PURE__*/ new StateUpdaterKey());
