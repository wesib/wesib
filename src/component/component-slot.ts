import { AfterEvent, EventKeeper, OnEvent } from '@proc7ts/fun-events';
import { Supply } from '@proc7ts/supply';
import { ComponentContext } from './component-context';
import { ComponentSlot$ } from './component-slot.impl';

/**
 * A component slot.
 *
 * It is added to {@link ComponentElement component element} and contains a bound component context.
 *
 * Notifies on component binding.
 *
 * @category Core
 * @typeParam T - A type of component.
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
   * Binds a component to element by the give `binder`.
   *
   * @param binder - Component slot binder.
   */
  bindBy(binder: ComponentSlot.Binder<T>): void;

  /**
   * Unbinds component from element.
   *
   * This method is not typically used by client code.
   *
   * After this method call the component may be reconstructed again by its {@link bindBy binder}.
   */
  unbind(): void;

  /**
   * Tries to re-bind component context by its {@link bindBy binder}.
   *
   * Does nothing if component is bound already.
   *
   * @returns Either a bound component context, or `undefined` if component can not be bound.
   */
  rebind(): ComponentContext<T> | undefined;
}

/**
 * A key of component element property containing a reference to component slot.
 *
 * @category Core
 */
export const ComponentSlot__symbol = /*#__PURE__*/ Symbol('ComponentSlot');

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
  [ComponentSlot__symbol]?: ComponentSlot<T> | undefined;
}

/**
 * @category Core
 */
export namespace ComponentSlot {
  /**
   * A binding of component to element.
   *
   * This is passed to {@link Binder component binder}. The latter can use it to assign the bound component.
   *
   * @typeParam T - A type of component.
   */
  export interface Binding<T extends object> {
    /**
     * Assigns a context of the component bound to target element.
     *
     * @param context - Bound component context.
     *
     * @returns Binding supply. Cut off once the component {@link ComponentSlot.unbind unbound}.
     */
    bind(this: void, context: ComponentContext<T>): Supply;
  }

  /**
   * A binder of component to element.
   *
   * Controls component construction and binding to element.
   *
   * @typeParam T - A type of component.
   */
  export type Binder<T extends object> =
    /**
     * @param binding - Component binding to element.
     */
    (this: void, binding: Binding<T>) => void;
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

    return (element[ComponentSlot__symbol] = new ComponentSlot$());
  },
};
