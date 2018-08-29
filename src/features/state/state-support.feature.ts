import { ComponentContext, ComponentValueKey } from '../../component';
import { WebFeature } from '../../decorators';
import { EventEmitter, EventProducer } from '../../events';
import { BootstrapContext } from '../../feature';

/**
 * Component state support feature.
 *
 * When enabled, it registers context values for each component with the following keys:
 *
 * - `ComponentValueKey.stateRefresh` that allows to inform that component state changed, and
 * - `StateSupport.stateUpdates` that allows to listen for the above notifications.
 *
 * Other features would use this to notify when the state changes. E.g. `DomPropertiesSupport` and `AttributesSupport`
 * features issue state refresh when needed.
 */
@WebFeature({
  configure: enableStateSupport,
})
export class StateSupport {

  /**
   * Component value key containing a component state updates event producer.
   */
  static readonly stateUpdates: ComponentValueKey<EventProducer<(this: void) => void>> =
      new ComponentValueKey('state-updates');

}

type StateEmitter = EventEmitter<(this: void) => void>;
const StateEmitter = EventEmitter;
const stateEmitterKey = Symbol('state-emitter');

function stateEmitterOf(context: ComponentContext): StateEmitter {
  return (context as any)[stateEmitterKey];
}

function enableStateSupport(context: BootstrapContext) {
  context.onElement((el, ctx) => {
    (ctx as any)[stateEmitterKey] = new StateEmitter;
  });
  context.provide(StateSupport.stateUpdates, ctx => {
    return stateEmitterOf(ctx).on;
  });
  context.provide(ComponentValueKey.stateRefresh, ctx => {

    const stateEmitter = stateEmitterOf(ctx);

    return () => stateEmitter.notify();
  });
}
