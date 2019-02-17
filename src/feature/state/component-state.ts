import { ContextKey, SingleContextKey } from 'context-values';
import { StateTracker } from 'fun-events';

const KEY = /*#__PURE__*/ new SingleContextKey<ComponentState>('component-state');

/**
 * Component state tracker.
 */
export class ComponentState extends StateTracker {

  static get key(): ContextKey<ComponentState> {
    return KEY;
  }

}
