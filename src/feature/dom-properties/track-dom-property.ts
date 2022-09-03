import { OnEvent, StatePath, supplyOn, translateOn, ValueTracker } from '@proc7ts/fun-events';
import { Supply } from '@proc7ts/supply';
import { ComponentContext } from '../../component';
import { ComponentState } from '../state';
import { domPropertyPathTo } from './dom-property-path';

/**
 * @internal
 */
type DomElementWithProperty<T> = {
  [key in keyof any]: T;
};

/**
 * @internal
 */
class DomPropertyTracker<T> extends ValueTracker<T> {

  readonly on: OnEvent<[T, T]>;
  readonly supply = new Supply();
  private readonly _key: string;

  constructor(
    private readonly _context: ComponentContext,
    key: PropertyKey,
    private readonly _path: StatePath,
  ) {
    super();
    this._key = key as string;
    this.on = this._context
      .get(ComponentState)
      .track(this._path)
      .onUpdate.do(
        translateOn((send, _path, newValue, oldValue) => send(newValue, oldValue)),
        supplyOn(this),
      );
  }

  get it(): T {
    return (this._context.element as DomElementWithProperty<T>)[this._key];
  }

  set it(value: T) {
    if (!this.supply.isOff) {
      (this._context.element as DomElementWithProperty<T>)[this._key] = value;
    }
  }

}

/**
 * Creates a tracker of custom element's DOM property value.
 *
 * Requires property to be defined. E.g. with {@link DomProperty @DomProperty} decorator.
 *
 * @category Feature
 * @typeParam T - A type of DOM property value.
 * @param context - Target component context.
 * @param key - Property key.
 * @param path - Custom property state path.
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
