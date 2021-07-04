import { cxConstAsset } from '@proc7ts/context-builder';
import { CxEntry } from '@proc7ts/context-values';
import { StateTracker } from '@proc7ts/fun-events';
import { StateUpdater } from '../../component';

/**
 * Component state tracker.
 *
 * @category Feature
 */
export class ComponentState extends StateTracker {

  static perContext(target: CxEntry.Target<ComponentState>): CxEntry.Definition<ComponentState> {
    return {
      assign: ComponentState$assign(target, target => target.recentAsset),
      assignDefault: ComponentState$assign(target, _target => new ComponentState()),
    };
  }

  static override toString(): string {
    return '[ComponentState]';
  }

}

function ComponentState$assign(
    target: CxEntry.Target<ComponentState>,
    getState: (target: CxEntry.Target<ComponentState>) => ComponentState | null | undefined,
): (assigner: CxEntry.Assigner<ComponentState>) => void {

  const get = target.lazy(target => {

    const state = getState(target);

    if (state) {
      target.provide(cxConstAsset(StateUpdater, state.update));
    }

    return state;
  });

  return assigner => {

    const state = get();

    if (state) {
      target.supply.whenOff(reason => state.done(reason));
      assigner(state);
    }

    return state;
  };
}
