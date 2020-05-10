/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { ContextKey, ContextKey__symbol, ContextValueSlot, SimpleContextKey } from '@proc7ts/context-values';
import { eventSupplyOf, StateTracker } from '@proc7ts/fun-events';
import { ComponentContext, StateUpdater } from '../../component';

class ComponentStateKey extends SimpleContextKey<ComponentState> {

  constructor() {
    super('component-state');
  }

  grow(
      slot: ContextValueSlot<ComponentState, ComponentState, SimpleContextKey.Seed<ComponentState>>,
  ): void {

    const provided = slot.seed();
    let state: ComponentState;

    if (provided != null) {
      state = provided;
      slot.insert(state);
    } else if (slot.hasFallback) {
      return;
    } else {
      state = new ComponentState();
      eventSupplyOf(slot.context.get(ComponentContext)).whenOff(reason => state.done(reason));
      slot.insert(state);
    }

    slot.setup(({ registry }) => {
      registry.provide({ a: StateUpdater, is: state.update });
    });
  }

}

/**
 * @internal
 */
const ComponentState__key = (/*#__PURE__*/ new ComponentStateKey());

/**
 * Component state tracker.
 *
 * @category Feature
 */
export class ComponentState extends StateTracker {

  static get [ContextKey__symbol](): ContextKey<ComponentState> {
    return ComponentState__key;
  }

}
