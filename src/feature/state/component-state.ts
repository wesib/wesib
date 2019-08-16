/**
 * @module @wesib/wesib
 */
import { ContextKey, ContextKey__symbol, SingleContextKey } from 'context-values';
import { StateTracker } from 'fun-events';

const ComponentState__key = /*#__PURE__*/ new SingleContextKey<ComponentState>('component-state');

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
