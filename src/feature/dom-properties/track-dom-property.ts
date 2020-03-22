/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { nextArgs } from '@proc7ts/call-thru';
import {
  EventReceiver,
  eventSupply,
  EventSupply,
  EventSupply__symbol,
  eventSupplyOf,
  OnEvent,
  StatePath,
  ValueTracker,
} from '@proc7ts/fun-events';
import { ComponentContext } from '../../component';
import { ComponentState } from '../state';
import { domPropertyPathTo } from './dom-property-path';

class DomPropertyTracker<T> extends ValueTracker<T> {

  readonly [EventSupply__symbol] = eventSupply();

  constructor(
      private readonly _context: ComponentContext,
      private readonly _key: PropertyKey,
      private readonly _path: StatePath,
  ) {
    super();
  }

  get it(): T {
    return this._context.element[this._key];
  }

  set it(value: T) {
    if (!eventSupplyOf(this).isOff) {
      this._context.element[this._key] = value;
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
 * Creates a tracker of custom element's DOM property value.
 *
 * Requires [[DomPropertiesSupport]] feature to be enabled and property to be defined. E.g. with {@link DomProperty
 * @DomProperty} decorator.
 *
 * @category Feature
 * @typeparam T  A type of DOM property value.
 * @param context  Target component context.
 * @param key  Property key.
 * @param path  Custom property state path.
 *
 * @returns New DOM property value tracker.
 */
export function trackDomProperty<T = any>(
    context: ComponentContext,
    key: PropertyKey,
    path: StatePath = domPropertyPathTo(key),
): ValueTracker<T> {
  return new DomPropertyTracker(context, key, path);
}
