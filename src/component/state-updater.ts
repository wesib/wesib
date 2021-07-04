import { CxEntry, cxEvaluated } from '@proc7ts/context-values';
import { statePath, StatePath } from '@proc7ts/fun-events';

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
  perContext: (/*#__PURE__*/ cxEvaluated(StateUpdater$create)),
  toString: () => '[StateUpdater]',
};

function StateUpdater$create(target: CxEntry.Target<StateUpdater, StateUpdater.Normalized>): StateUpdater {

  let updaters: StateUpdater.Normalized[] = [];

  target.trackAssetList(assets => {

    const newUpdaters: StateUpdater.Normalized[] = [];

    for (let i = assets.length - 1; i >= 0; --i) {
      assets[i].eachRecentAsset(updater => {
        newUpdaters.push(updater);
      });
    }

    updaters = newUpdaters;
  });

  target.supply.whenOff(() => updaters = []);

  return <TValue>(path: StatePath, newValue: TValue, oldValue: TValue) => {
    path = statePath(path);
    for (const updater of updaters) {
      updater(path, newValue, oldValue);
    }
  };
}
