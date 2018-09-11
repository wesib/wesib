import { ContextValueKey, ContextValues, EventProducer, noop, SingleValueKey, StateUpdateConsumer } from '../common';

/**
 * Component context.
 *
 * Passed to component constructor as its only parameter.
 *
 * Extends `ContextValues` interface. The values are provided by corresponding providers registered with
 * `BootstrapContext.forComponent()` method.
 *
 * @param <T> A type of component.
 */
export interface ComponentContext<T extends object = object> extends ContextValues {

  /**
   * Custom element constructed for the component according to its type.
   *
   * E.g. `HTMLElement` instance.
   */
  readonly element: any;

  /**
   * A component instance.
   *
   * It is an error accessing this property before the component is created, e.g. from inside of `ComponentListener`
   * or component constructor. In these cases you may wish to add a `whenReady()` callback.
   */
  readonly component: T;

  /**
   * Whether the custom element is connected.
   *
   * This becomes `true` right before `onConnect` is called, and becomes false right before `onDisconnect` is called.
   */
  readonly connected: boolean;

  /**
   * Registers custom element connection listener.
   *
   * This listener will be called when custom element is connected, i.e. its `connectedCallback()` method is called.
   *
   * @param listener A listener to notify on element connection.
   *
   * @return An event interest instance.
   */
  readonly onConnect: EventProducer<(this: this) => void>;

  /**
   * Registers custom element disconnection listener.
   *
   * This listener will be called when custom element is disconnected, i.e. its `disconnectedCallback()` method is
   * called.
   *
   * @param listener A listener to notify on element disconnection.
   *
   * @return An event interest instance.
   */
  readonly onDisconnect: EventProducer<(this: this) => void>;

  /**
   * Updates component's state.
   *
   * It is a shorthand for invoking a component state update function available under
   * `[ComponentContext.stateUpdateKey]` key.
   *
   * Note that state update has no effect unless `StateSupport` feature is enabled or
   * `[ComponentContext.stateUpdateKey]` context value is provided by other means.
   *
   * @param <V> A type of changed value.
   * @param key Changed value key.
   * @param newValue New value.
   * @param oldValue Previous value.
   */
  readonly updateState: StateUpdateConsumer;

  /**
   * Registers component readiness callback.
   *
   * The component is constructed shortly after custom element. So the component may not exist when requested
   * e.g. inside component constructor or inside `ComponentListener`. The registered callback will be notified when
   * the component is constructed.
   *
   * If the component is constructed already, the callback will be notified immediately.
   *
   * @param callback A callback to notify on component construction.
   */
  whenReady(callback: (this: this, component: T) => void): void;

  /**
   * Returns a `super` property value inherited from custom element parent.
   *
   * @param name Target property name.
   */
  elementSuper(name: string): any;

}

/**
 * Component context value provider.
 *
 * It is responsible for constructing the values associated with particular key for each component.
 *
 * This function is called at most once per component.
 *
 * @param <S> The type of source value.
 * @param context Target component context.
 *
 * @return Either constructed value, or `null`/`undefined` if the value can not be constructed.
 */
export type ComponentValueProvider<S> =
    <T extends object>(this: void, context: ComponentContext<T>) => S | null | undefined;

export namespace ComponentContext {

  /**
   * Context value key containing a component state update function.
   *
   * Features are calling this function by default when component state changes, e.g. attribute value or DOM property
   * modified.
   *
   * Note that this value is not provided, unless the `StateSupport` feature is enabled.
   */
  export const stateUpdateKey: ContextValueKey<StateUpdateConsumer> =
      new SingleValueKey<StateUpdateConsumer>('state-update', () => noop);

  /**
   * A key of a custom element and component properties containing a reference to component context.
   */
  export const symbol = Symbol('component-context');

  /**
   * Extracts component context from its custom element or from component itself.
   *
   * @param element Custom element instance created for the component or the component itself.
   *
   * @return Component context reference stored under `[ComponentContext.symbol]` key.
   *
   * @throws TypeError When the given `element` does not contain component context reference.
   */
  export function of<T extends object>(element: any): ComponentContext<T> {

    const context = element[symbol];

    if (!context) {
      throw TypeError(`No component context found in ${element}`);
    }

    return context;
  }

}
