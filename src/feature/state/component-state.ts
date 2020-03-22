/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { ContextKey, ContextKey__symbol, SingleContextKey } from '@proc7ts/context-values';
import { StateTracker } from '@proc7ts/fun-events';

/**
 * @internal
 */
const ComponentState__key = (/*#__PURE__*/ new SingleContextKey<ComponentState>('component-state'));

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
