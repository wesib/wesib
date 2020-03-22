/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { nextArgs } from '@proc7ts/call-thru';
import {
  EventReceiver,
  EventSupply,
  eventSupply,
  EventSupply__symbol,
  eventSupplyOf,
  OnEvent,
  StatePath,
  ValueTracker,
} from '@proc7ts/fun-events';
import { ComponentContext } from '../../component';
import { ComponentState } from '../state';
import { attributePathTo } from './attribute-path';

class AttributeTracker extends ValueTracker<string | null> {

  readonly [EventSupply__symbol] = eventSupply();

  constructor(
      private readonly _context: ComponentContext,
      private readonly _name: string,
      private readonly _path: StatePath,
  ) {
    super();
  }

  get it(): string | null {
    return this._context.element.getAttribute(this._name);
  }

  set it(value: string | null) {
    if (!eventSupplyOf(this).isOff) {
      if (value == null) {
        this._context.element.removeAttribute(this._name);
      } else {
        this._context.element.setAttribute(this._name, value);
      }
    }
  }

  on(): OnEvent<[string | null, string | null]>;
  on(receiver: EventReceiver<[string | null, string | null]>): EventSupply;
  on(
      receiver?: EventReceiver<[string | null, string | null]>,
  ): OnEvent<[string | null, string | null]> | EventSupply {
    return (this.on = this._context.get(ComponentState).track(this._path).onUpdate().thru(
        (_path, newValue, oldValue) => nextArgs(newValue, oldValue),
    ).tillOff(this).F)(receiver);
  }

}

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
  return new AttributeTracker(context, name, path);
}
