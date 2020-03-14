/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { nextArgs } from 'call-thru';
import {
  EventSupply,
  eventSupply,
  EventSupply__symbol,
  eventSupplyOf,
  OnEvent,
  StatePath,
  ValueTracker,
} from 'fun-events';
import { EventReceiver } from 'fun-events/d.ts/base';
import { ComponentContext } from '../../component';
import { ComponentState } from './component-state';
import { statePropertyPathTo } from './state-property-path';

class StatePropertyTracker<T> extends ValueTracker<T> {

  readonly [EventSupply__symbol] = eventSupply();

  constructor(
      private readonly _context: ComponentContext,
      private readonly _key: PropertyKey,
      private readonly _path: StatePath,
  ) {
    super();
  }

  get it(): T {
    return this._context.component[this._key];
  }

  set it(value: T) {
    if (!eventSupplyOf(this).isOff) {
      this._context.component[this._key] = value;
    }
  }

  on(): OnEvent<[T, T]>;
  on(receiver: EventReceiver<[T, T]>): EventSupply;
  on(receiver?: EventReceiver<[T, T]>): OnEvent<[T, T]> | EventSupply {
    return (this.on = this._context.get(ComponentState).track(this._path).onUpdate().thru(
        (_path, newValue, oldValue) => nextArgs(newValue, oldValue),
    ).tillOff(this).F)(receiver);
  }

}

/**
 * Creates a tracker of component state value.
 *
 * Requires [[StateSupport]] feature to be enabled and property to be defined. E.g. with {@link StateProperty
 * @StateProperty} decorator.
 *
 * @category Feature
 * @typeparam T  A type of state property value.
 * @param context  Target component context.
 * @param key  Property key.
 * @param path  Property state path.
 *
 * @returns New state property value tracker.
 */
export function trackStateProperty<T = any>(
    context: ComponentContext,
    key: PropertyKey,
    path: StatePath = statePropertyPathTo(key),
): ValueTracker<T> {
  return new StatePropertyTracker(context, key, path);
}
