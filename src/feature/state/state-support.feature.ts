import { ComponentContext, StateUpdater } from '../../component';
import { FeatureDef, FeatureDef__symbol } from '../feature-def';
import { ComponentState } from './component-state';

const StateSupport__feature: FeatureDef = {
  perComponent: [
    {
      a: ComponentState,
      by(context: ComponentContext) {

        const state = new ComponentState();

        context.whenDestroyed(reason => state.done(reason));

        return state;
      }
    },
    {
      a: StateUpdater,
      by(state: ComponentState) {
        return state.update;
      },
      with: [ComponentState],
    },
  ],
};

/**
 * Component state support feature.
 *
 * When enabled, it registers context values for each component with the following keys:
 *
 * - `[StateUpdater.key]` that allows to update the component state, and
 * - `[ComponentState.key]` containing a `ComponentState` instance to track the state changes.
 *
 * Other features would use this to notify when the state changes. E.g. `DomPropertiesSupport` and `AttributesSupport`
 * features issue state updates when needed.
 */
export class StateSupport {

  static get [FeatureDef__symbol](): FeatureDef {
    return StateSupport__feature;
  }

}
