import { AfterEvent, AfterEvent__symbol, digOn_, EventKeeper, onceOn, OnEvent, trackValue } from '@proc7ts/fun-events';
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

  private readonly _ctx = trackValue<ComponentContext<T>>();
  readonly whenReady: OnEvent<[ComponentContext<T>]>;

  constructor() {
    this.whenReady = this._ctx.read.do(
        digOn_(ctx => ctx && ctx.whenReady),
        onceOn,
    );
  }

  get context(): ComponentContext<T> | undefined {
    return this._ctx.it;
  }

  get read(): AfterEvent<[ComponentContext<T>?]> {
    return this._ctx.read;
  }

  [AfterEvent__symbol](): AfterEvent<[ComponentContext<T>?]> {
    return this._ctx.read;
  }

  bind(context: ComponentContext<T>): void {
    this._ctx.it = context;
  }

  unbind(): void {
    this._ctx.it = undefined;
  }

}


