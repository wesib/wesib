import { OnEvent, StatePath, supplyOn, translateOn, ValueTracker } from '@proc7ts/fun-events';
import { Supply } from '@proc7ts/supply';
import { ComponentContext } from '../../component';
import { ComponentState } from '../state';
import { attributePathTo } from './attribute-path';

class AttributeTracker extends ValueTracker<string | null> {

  readonly on: OnEvent<[string | null, string | null]>;
  readonly supply = new Supply();

  constructor(
      private readonly _context: ComponentContext,
      private readonly _name: string,
      path: StatePath,
  ) {
    super();
    this.on = this._context.get(ComponentState).track(path).onUpdate.do(
        translateOn((send, _path, newValue, oldValue) => send(newValue, oldValue)),
        supplyOn(this),
    );
  }

  get it(): string | null {
    return (this._context.element as Element).getAttribute(this._name);
  }

  set it(value: string | null) {
    if (!this.supply.isOff) {
      if (value == null) {
        (this._context.element as Element).removeAttribute(this._name);
      } else {
        (this._context.element as Element).setAttribute(this._name, value);
      }
    }
  }

}

/**
 * Creates a tracker of custom element's attribute value.
 *
 * Requires attribute to be defined. E.g. with {@link Attribute @Attribute}, {@link AttributeChanged @AttributeChanged},
 * or {@link Attributes @Attributes} decorator.
 *
 * @category Feature
 * @param context - Target component context.
 * @param name - Attribute name.
 * @param path - Custom attribute state path.
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
