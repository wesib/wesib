import { EventEmitter, StateUpdateConsumer, StateValueKey } from '../../common';
import { ComponentValueKey } from '../../component';
import { WebFeature } from '../../decorators';
import { BootstrapContext } from '../../feature';
import { StateTracker } from './state-tracker';

/**
 * Component state support feature.
 *
 * When enabled, it registers context values for each component with the following keys:
 *
 * - `ComponentValueKey.stateUpdate` that allows to update the component state, and
 * - `StateTracker.key` containing a `StateTracker` instance to track the state changes.
 *
 * Other features would use this to notify when the state changes. E.g. `DomPropertiesSupport` and `AttributesSupport`
 * features issue state updates when needed.
 */
@WebFeature({
  configure: enableStateSupport,
})
export class StateSupport {
}

function enableStateSupport(context: BootstrapContext) {
  context.provide(StateTracker.key, () => {

    const emitter = new EventEmitter<StateUpdateConsumer>();

    class Tracker implements StateTracker {

      readonly onStateUpdate = emitter.on;

      updateState<V>(key: PropertyKey, newValue: V, oldValue: V) {
        emitter.notify(key, newValue, oldValue);
      }

    }

    return new Tracker();
  });
  context.provide(ComponentValueKey.stateUpdate, ctx => {

    const stateTracker = ctx.get(StateTracker.key);

    return <V>(key: StateValueKey, newValue: V, oldValue: V) => stateTracker.updateState(key, newValue, oldValue);
  });
}
