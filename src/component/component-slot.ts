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
import { neverSupply, Supply } from '@proc7ts/supply';
import { ComponentContext } from './component-context';

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
   * After this method call the component may be reconstructed again by its {@link bindBy provider}.
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

    return element[ComponentSlot__symbol] = new ComponentSlot$();
  },

};

const ComponentSlot$empty: ComponentSlot$Provider<any> = {
  get: noop,
  unbind: noop,
  drop: noop,
};

class ComponentSlot$<T extends object> implements ComponentSlot<T> {

  readonly _provider = trackValue<ComponentSlot$Provider<T>>(ComponentSlot$empty);
  readonly read: AfterEvent<[ComponentContext<T>?]>;
  readonly whenReady: OnEvent<[ComponentContext<T>]>;

  constructor() {
    this.read = this._provider.read.do(
        mapAfter(provider => provider.get()),
    );
    this.whenReady = this.read.do(
        digOn_(ctx => ctx && ctx.whenReady),
        onceOn,
    );
  }

  get context(): ComponentContext<T> | undefined {
    return this._provider.it.get();
  }

  [AfterEvent__symbol](): AfterEvent<[ComponentContext<T>?]> {
    return this.read;
  }

  bind(context: ComponentContext<T>): void {
    this._provider.it.drop();
    this._provider.it = ComponentSlot$known(this, context);
  }

  bindBy(binder: ComponentSlot.Binder<T>): void {
    this._provider.it.drop();
    this._provider.it = ComponentSlot$bound(this, binder);
  }

  unbind(): void {
    this._provider.it.unbind();
  }

}

interface ComponentSlot$Provider<T extends object> {
  get(): ComponentContext<T> | undefined;
  unbind(): void;
  drop(): void;
}

function ComponentSlot$known<T extends object>(
    slot: ComponentSlot$<T>,
    context: ComponentContext<T> | undefined,
): ComponentSlot$Provider<T> {
  context?.supply.whenOff(() => {
    if (slot.context === context) {
      slot.unbind();
    }
  });

  return {
    get: () => context,
    unbind() {
      context = undefined;
      slot._provider.it = ComponentSlot$empty;
    },
    drop: noop,
  };
}

function ComponentSlot$bound<T extends object>(
    slot: ComponentSlot$<T>,
    binder: ComponentSlot.Binder<T>,
): ComponentSlot$Provider<T> {

  let supply = neverSupply();
  let getContext: () => ComponentContext<T> | undefined = noop;
  const get = (): ComponentContext<T> | undefined => getContext();
  const newSupply = (): Supply => supply = new Supply(() => {
    getContext = noop;
  });
  let bind = (context: ComponentContext<T>): Supply => {
    getContext = valueProvider(context);
    context.supply.whenOff(() => {
      if (slot.context === context) {
        slot.unbind();
      }
    });
    return newSupply();
  };
  const drop = (): void => {
    bind = _ => neverSupply();
    supply.off();
  };
  const unbind = (): void => {
    supply.off();
    slot._provider.it = {
      get,
      unbind,
      drop,
    };
  };

  getContext = () => {
    binder({
      bind: context => bind(context),
    });

    // Subsequent bind calls update the component provider
    bind = context => {
      supply.off();
      getContext = valueProvider(context);
      slot._provider.it = {
        get,
        unbind,
        drop,
      };
      return newSupply();
    };

    return getContext();
  };

  return {
    get,
    unbind,
    drop,
  };
}
