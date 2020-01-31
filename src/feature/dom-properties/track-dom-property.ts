import { nextArgs } from 'call-thru';
import { eventSupply, OnEvent, StatePath, ValueTracker } from 'fun-events';
import { ComponentContext } from '../../component';
import { ComponentState } from '../state';
import { domPropertyPathTo } from './dom-property-path';

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

  const { element } = context;
  const state = context.get(ComponentState).track(path);
  const supply = eventSupply();
  const on: OnEvent<[T, T]> = state.onUpdate.thru(
      (_path, newValue, oldValue) => nextArgs(newValue, oldValue),
  ).tillOff(supply);

  class AttributeTracker extends ValueTracker<T> {

    get on(): OnEvent<[T, T]> {
      return on;
    }

    get it(): T {
      return element[key];
    }

    set it(value: T) {
      element[key] = value;
    }

    done(reason?: any): this {
      supply.off(reason);
      return this;
    }

  }

  return new AttributeTracker();
}
