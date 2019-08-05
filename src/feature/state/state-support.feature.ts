/**
 * @module @wesib/wesib
 */
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
 * When enabled, it registers the following component context values:
 *
 * - [[StateUpdater]] that allows to update the component state, and
 * - [[ComponentState]] that allows to track component state changes.
 *
 * Other features would use this to notify when the state changes. E.g. [[DomPropertiesSupport]]
 * and [[AttributesSupport]] features issue state updates when needed.
 *
 * @category Feature
 */
export class StateSupport {

  static get [FeatureDef__symbol](): FeatureDef {
    return StateSupport__feature;
  }

}
