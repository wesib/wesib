import { StatePath as StatePath_, StateTracker as StateTracker_, StateUpdater as StateUpdater_ } from 'fun-events';
import { ContextValueKey, SingleValueKey } from './context';
import { noop } from './functions';

export type StatePath = StatePath_;

export namespace StatePath {

  /**
   * A path to sub-state containing element properties.
   *
   * Thus a property state path is always something like `[StatePath.property, 'property-name']`.
   */
  export const property = Symbol('property');

  /**
   * A path to sub-state containing element an attributes.
   *
   * Thus, an attribute state path is always something like `[StatePath.attribute, 'attribute-name']`.
   */
  export const attribute = Symbol('attribute');

}

export type StateUpdater = StateUpdater_;

export namespace StateUpdater {

  /**
   * A key of component context value containing a component state updates consumer function.
   *
   * Features are calling this function by default when component state changes, e.g. attribute value or DOM property
   * modified.
   *
   * Note that this value is not provided, unless the `StateSupport` feature is enabled.
   */
  export const key: ContextValueKey<StateUpdater> = new SingleValueKey('state-updater', () => noop);

}

export class StateTracker extends StateTracker_ {

  /**
   * A `StateTracker` component context value key.
   */
  static readonly key: ContextValueKey<StateTracker> = new SingleValueKey('state-tracker');

}
