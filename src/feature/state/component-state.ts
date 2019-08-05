/**
 * @module @wesib/wesib
 */
import { ContextKey, SingleContextKey } from 'context-values';
import { StateTracker } from 'fun-events';

const ComponentState__key = /*#__PURE__*/ new SingleContextKey<ComponentState>('component-state');

/**
 * Component state tracker.
 *
 * @category Feature
 */
export class ComponentState extends StateTracker {

  static get key(): ContextKey<ComponentState> {
    return ComponentState__key;
  }

}
