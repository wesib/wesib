import { cxDynamic, CxEntry } from '@proc7ts/context-values';
import { statePath, StatePath } from '@proc7ts/fun-events';
import { asis } from '@proc7ts/primitives';

/**
 * Component state updater signature.
 *
 * @category Core
 * @typeParam TValue - Updated value type
 * @param path - Updated state node path.
 * @param newValue - New value.
 * @param oldValue - Replaced value.
 */
export type StateUpdater = <TValue>(
    this: void,
    path: StatePath,
    newValue: TValue,
    oldValue: TValue,
) => void;

/**
 * @category Core
 */
export namespace StateUpdater {

  /**
   * Normalized component state updater signature.
   *
   * Accepts normalized state path.
   *
   * @typeParam TValue - Updated value type
   * @param path - Normalized path of updated state node.
   * @param newValue - New value.
   * @param oldValue - Replaced value.
   */
  export type Normalized = <TValue>(
      this: void,
      path: StatePath.Normalized,
      newValue: TValue,
      oldValue: TValue,
  ) => void;

}

/**
 * Component context entry containing a component {@link StateUpdater state updater} function.
 *
 * This function is called by default when component state changes, e.g. attribute value or DOM property modified.
 *
 * Does nothing by default and after component destruction.
 *
 * When multiple state updaters provided, they all will be called on each state update, in reverse order.
 *
 * @category Core
 */
export const StateUpdater: CxEntry<StateUpdater, StateUpdater.Normalized> = {
  perContext: (/*#__PURE__*/ cxDynamic<StateUpdater, StateUpdater.Normalized, StateUpdater.Normalized[]>({
    create: asis,
    byDefault: () => [],
    assign: ({ get, to }, { supply }) => {

      let update: StateUpdater = (path, newValue, oldValue) => {
        path = statePath(path);

        const updaters = get();

        for (let i = updaters.length - 1; i >= 0; --i) {
          updaters[i](path, newValue, oldValue);
        }
      };
      const updater: StateUpdater = (path, newValue, oldValue) => update(
          path,
          newValue,
          oldValue,
      );
      let assigner: CxEntry.Assigner<StateUpdater> = receiver => to(
          (_, by) => receiver(updater, by),
      );

      supply.whenOff(() => {
        update = StateUpdater$noop;
        assigner = StateUpdater$noop$assigner;
      });

      return receiver => assigner(receiver);
    },
  })),
  toString: () => '[StateUpdater]',
};

function StateUpdater$noop$assigner(receiver: CxEntry.Receiver<StateUpdater>): void {
  receiver(StateUpdater$noop);
}

function StateUpdater$noop(_path: StatePath, _newValue: unknown, _oldValue: unknown): void {
  // Do not update the state.
}
