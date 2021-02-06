import { ContextValueSlot } from '@proc7ts/context-values';
import { ContextUpKey, ContextUpRef } from '@proc7ts/context-values/updatable';
import { AfterEvent, afterThe, digAfter, EventKeeper, statePath, StatePath } from '@proc7ts/fun-events';
import { mergeFunctions, noop } from '@proc7ts/primitives';

/**
 * Component state updater signature.
 *
 * @category Core
 */
export type StateUpdater =
/**
 * @typeParam TValue - Updated value type
 * @param path - Updated state node path.
 * @param newValue - New value.
 * @param oldValue - Replaced value.
 */
    <TValue>(this: void, path: StatePath, newValue: TValue, oldValue: TValue) => void;

/**
 * @category Core
 */
export namespace StateUpdater {

  /**
   * Normalized component state updater signature.
   *
   * Accepts normalized state path.
   */
  export type Normalized =
  /**
   * @typeParam TValue - Updated value type
   * @param path - Normalized path of updated state node.
   * @param newValue - New value.
   * @param oldValue - Replaced value.
   */
      <TValue>(this: void, path: StatePath.Normalized, newValue: TValue, oldValue: TValue) => void;

}

/**
 * @internal
 */
class StateUpdaterKey extends ContextUpKey<StateUpdater, StateUpdater.Normalized> {

  readonly upKey: ContextUpKey.UpKey<StateUpdater, StateUpdater.Normalized>;

  constructor() {
    super('state-updater');
    this.upKey = this.createUpKey(
        slot => slot.insert(slot.seed.do(digAfter(
            (...fns) => {
              if (fns.length) {

                const combined: StateUpdater.Normalized = fns.reduce(
                    (prev, fn) => mergeFunctions(fn, prev),
                    noop,
                );

                return afterThe((path, newValue, oldValue) => combined(statePath(path), newValue, oldValue));
              }

              if (slot.hasFallback && slot.or) {
                return slot.or;
              }

              return afterThe(noop);
            },
        ))),
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
    )!(
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
 * Does nothing by default and after component destruction.
 *
 * When multiple state updaters provided, they all will be called on each state update, in reverse order.
 *
 * @category Core
 */
export const StateUpdater: ContextUpRef<StateUpdater, StateUpdater.Normalized> = (/*#__PURE__*/ new StateUpdaterKey());
