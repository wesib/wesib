import { StateUpdater } from '../../component';
import { FeatureDef, FeatureDef__symbol } from '../feature-def';
import { ComponentState } from './component-state';

const DEF: FeatureDef = {
  perComponent: [
    { as: ComponentState },
    {
      a: StateUpdater,
      by(tracker: ComponentState) {
        return tracker.update;
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
    return DEF;
  }

}
