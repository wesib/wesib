import { EventProducer, StatePath, StateTracker, StateUpdater } from 'fun-events';
import { ContextKey, SingleContextKey } from './context';

declare module 'fun-events' {

  export type StatePath = PropertyKey | StatePath.Normalized;

  export namespace StatePath {

    export type Normalized = PropertyKey[];

    /**
     * A path to sub-state containing element properties.
     *
     * Thus a property state path is always something like `[StatePath.property, 'property-name']`.
     */
    export const property: unique symbol;

    /**
     * A path to sub-state containing element an attributes.
     *
     * Thus, an attribute state path is always something like `[StatePath.attribute, 'attribute-name']`.
     */
    export const attribute: unique symbol;

  }

  export type StateUpdater = <V>(this: void, path: StatePath, newValue: V, oldValue: V) => void;

  export namespace StateUpdater {

    export const noop: StateTracker;

    /**
     * A key of component context value containing a component state updates consumer function.
     *
     * Features are calling this function by default when component state changes, e.g. attribute value or DOM property
     * modified.
     *
     * Note that this value is not provided, unless the `StateSupport` feature is enabled.
     */
    export const key: ContextKey<StateUpdater>;

  }

  export class StateTracker {

    /**
     * A `StateTracker` component context value key.
     */
    static readonly key: ContextKey<StateTracker>;

    readonly onUpdate: EventProducer<StateUpdater>;

    readonly update: StateUpdater;

    track(path: StatePath): StateTracker;

  }

}

(StatePath as any).property = Symbol('property');
(StatePath as any).attribute = Symbol('attribute');
(StateUpdater as any).key = new SingleContextKey('state-updater', () => StateUpdater.noop);
(StateTracker as any).key = new SingleContextKey('state-tracker');
