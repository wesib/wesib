import { StateUpdater } from '../../common';
import { BootstrapContext, Feature } from '../../feature';
import { StateTracker } from './state-tracker';
import { StateTracker as StateTrackerImpl } from './state-tracker.impl';

/**
 * Component state support feature.
 *
 * When enabled, it registers context values for each component with the following keys:
 *
 * - `[StateUpdater.key]` that allows to update the component state, and
 * - `[StateTracker.key]` containing a `StateTracker` instance to track the state changes.
 *
 * Other features would use this to notify when the state changes. E.g. `DomPropertiesSupport` and `AttributesSupport`
 * features issue state updates when needed.
 */
@Feature({
  bootstrap: enableStateSupport,
})
export class StateSupport {
}

function enableStateSupport(context: BootstrapContext) {
  context.forComponents({
    provide: StateTracker,
    provider: StateTrackerImpl.create,
  });
  context.forComponents({
    provide: StateUpdater,
    provider(ctx) {
      return ctx.get(StateTracker).update;
    },
  });
}
