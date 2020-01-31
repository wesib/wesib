/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { nextArgs } from 'call-thru';
import { eventSupply, OnEvent, StatePath, ValueTracker } from 'fun-events';
import { ComponentContext } from '../../component';
import { ComponentState } from '../state';
import { attributePathTo } from './attribute-path';

/**
 * Creates a tracker of custom element's attribute value.
 *
 * Requires [[AttributesSupport]] feature to be enabled and attribute to be defined. E.g. with {@link Attribute
 * @Attribute}, {@link AttributeChanged @AttributeChanged}, or {@link Attributes @Attributes} decorator.
 *
 * @category Feature
 * @param context  Target component context.
 * @param name  Attribute name.
 * @param path  Custom attribute state path.
 *
 * @returns New attribute value tracker.
 */
export function trackAttribute(
    context: ComponentContext,
    name: string,
    path: StatePath = attributePathTo(name),
): ValueTracker<string | null> {

  const { element }: { element: Element } = context;
  const state = context.get(ComponentState).track(path);
  const supply = eventSupply();
  const on: OnEvent<[string | null, string | null]> = state.onUpdate.thru(
      (_path, newValue, oldValue) => nextArgs(newValue, oldValue),
  ).tillOff(supply);

  class AttributeTracker extends ValueTracker<string | null> {

    get on(): OnEvent<[string | null, string | null]> {
      return on;
    }

    get it(): string | null {
      return element.getAttribute(name);
    }

    set it(value: string | null) {
      if (value == null) {
        element.removeAttribute(name);
      } else {
        element.setAttribute(name, value);
      }
    }

    done(reason?: any): this {
      supply.off(reason);
      return this;
    }

  }

  return new AttributeTracker();
}
