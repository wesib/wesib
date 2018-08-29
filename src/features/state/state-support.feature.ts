import { ComponentContext, ComponentValueKey } from '../../component';
import { WebFeature } from '../../decorators';
import { EventEmitter, EventProducer } from '../../events';
import { BootstrapContext } from '../../feature';

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
