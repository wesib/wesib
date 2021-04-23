import {
  AfterEvent,
  AfterEvent__symbol,
  digOn_,
  EventKeeper,
  mapAfter,
  onceOn,
  OnEvent,
  trackValue,
} from '@proc7ts/fun-events';
import { noop, valueProvider } from '@proc7ts/primitives';
import { ComponentContext } from './component-context';

/**
 * A component slot.
 *
 * It is added to {@link ComponentElement component element} and contains a bound component context.
 *
 * Notifies on component binding.
 *
 * @category Core
 */
export interface ComponentSlot<T extends object = any> extends EventKeeper<[ComponentContext<T>?]> {

  /**
   * A context of the bound component.
   */
  readonly context: ComponentContext<T> | undefined;

  /**
   * An `AfterEvent` keeper of the bound component context.
   */
  readonly read: AfterEvent<[ComponentContext<T>?]>;

  /**
   * An `OnEvent` sender of the bound component {@link ComponentContext.whenReady readiness} event.
   */
  readonly whenReady: OnEvent<[ComponentContext<T>]>;

  /**
   * Binds a component to element.
   *
   * This method is not typically used by client code.
   *
   * @param context - The bound component context.
   */
  bind(context: ComponentContext<T>): void;

  /**
   * Binds a component provided by the given function to element.
   *
   * The component is created when its {@link context} requested for the first time.
   *
   * @param provider - Created component context constructor.
   */
  bindBy(provider: (this: void) => (ComponentContext<T> | undefined)): void;

  /**
   * Unbinds component from element.
   *
   * This method is not typically used by client code.
   */
  unbind(): void;

}

/**
 * A key of component element property containing a reference to component slot.
 *
 * @category Core
 */
export const ComponentSlot__symbol = (/*#__PURE__*/ Symbol('component-slot'));

/**
 * An element the component can be bound to.
 *
 * Such element may contain a {@link ComponentSlot component slot} containing a bound component context.
 *
 * @category Core
 * @typeParam T - A type of the bound component.
 */
export interface ComponentElement<T extends object = any> extends Element {

  /**
   * A component slot instance.
   *
   * A {@link ComponentSlot.of} function may be used to access the slot instance, or construct it when necessary.
   */
  [ComponentSlot__symbol]?: ComponentSlot<T>;

}

/**
 * @category Core
 */
export const ComponentSlot = {

  /**
   * Accesses a component slot of the given element. Attaches a new slot if necessary.
   *
   * @param element - Target element.
   *
   * @returns A component slot instance attached to the element.
   */
  of<T extends object>(this: void, element: ComponentElement<T>): ComponentSlot<T> {

    const found = element[ComponentSlot__symbol];

    if (found) {
      return found;
    }

    return element[ComponentSlot__symbol] = new ComponentSlot$();
  },

};

class ComponentSlot$<T extends object> implements ComponentSlot<T> {

  private readonly _ctx = trackValue<() => ComponentContext<T> | undefined>(noop);
  readonly read: AfterEvent<[ComponentContext<T>?]>;
  readonly whenReady: OnEvent<[ComponentContext<T>]>;

  constructor() {
    this.read = this._ctx.read.do(
        mapAfter(provider => provider()),
    );
    this.whenReady = this.read.do(
        digOn_(ctx => ctx && ctx.whenReady),
        onceOn,
    );
  }

  get context(): ComponentContext<T> | undefined {
    return this._ctx.it();
  }

  [AfterEvent__symbol](): AfterEvent<[ComponentContext<T>?]> {
    return this.read;
  }

  bind(context: ComponentContext<T>): void {
    this.bindBy(valueProvider(context));
  }

  bindBy(provider: (this: void) => (ComponentContext<T> | undefined)): void {
    this._ctx.it = provider;
  }

  unbind(): void {
    this.bindBy(noop);
  }

}


