import { OnEvent, StatePath, supplyOn, translateOn, ValueTracker } from '@proc7ts/fun-events';
import { Supply } from '@proc7ts/supply';
import { ComponentContext } from '../../component';
import { ComponentState } from './component-state';
import { statePropertyPathTo } from './state-property-path';

/**
 * @internal
 */
type ComponentWithProperty<T> = {
  [key in keyof any]: T;
};

class StatePropertyTracker<T> extends ValueTracker<T> {

  readonly on: OnEvent<[T, T]>;
  readonly supply = new Supply();
  private readonly _key: string;

  constructor(
    private readonly _context: ComponentContext<ComponentWithProperty<T>>,
    key: PropertyKey,
    path: StatePath,
  ) {
    super();
    this._key = key as string;
    this.on = _context
      .get(ComponentState)
      .track(path)
      .onUpdate.do(
        translateOn((send, _path, newValue, oldValue) => send(newValue, oldValue)),
        supplyOn(this),
      );
  }

  get it(): T {
    return this._context.component[this._key];
  }

  set it(value: T) {
    if (!this.supply.isOff) {
      this._context.component[this._key] = value;
    }
  }

}

/**
 * Creates a tracker of component state value.
 *
 * @category Feature
 * @typeParam T - A type of state property value.
 * @param context - Target component context.
 * @param key - Property key.
 * @param path - Property state path.
 *
 * @returns New state property value tracker.
 */
export function trackStateProperty<T = any>(
  context: ComponentContext,
  key: PropertyKey,
  path: StatePath = statePropertyPathTo(key),
): ValueTracker<T> {
  return new StatePropertyTracker(context as ComponentContext<ComponentWithProperty<T>>, key, path);
}
