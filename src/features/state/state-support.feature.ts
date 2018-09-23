import { EventEmitter, StateUpdateConsumer, StateValueKey } from '../../common';
import { ComponentContext } from '../../component';
import { BootstrapContext, WesFeature } from '../../feature';
import { StateTracker as StateTracker_ } from './state-tracker';

/**
 * Component state support feature.
 *
 * When enabled, it registers context values for each component with the following keys:
 *
 * - `[ComponentContext.stateUpdateKey]` that allows to update the component state, and
 * - `[StateTracker.key]` containing a `StateTracker` instance to track the state changes.
 *
 * Other features would use this to notify when the state changes. E.g. `DomPropertiesSupport` and `AttributesSupport`
 * features issue state updates when needed.
 */
@WesFeature({
  bootstrap: enableStateSupport,
})
export class StateSupport {
}

function enableStateSupport(context: BootstrapContext) {
  context.forComponents(StateTracker_.key, () => {

    const emitter = new EventEmitter<StateUpdateConsumer>();

    class StateTracker extends StateTracker_ {

      readonly onStateUpdate = emitter.on;

      readonly updateState: StateUpdateConsumer = <V>(key: StateValueKey, newValue: V, oldValue: V) => {
        emitter.notify(key, newValue, oldValue);
      }

    }

    return new StateTracker();
  });
  context.forComponents(ComponentContext.stateUpdateKey, ctx => ctx.get(StateTracker_.key).updateState);
}
