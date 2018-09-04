import { ContextValueKey, ContextValues, EventProducer, noop, SingleValueKey, StateUpdateConsumer } from '../common';

/**
 * Web component context.
 *
 * Passed to component constructor as its only parameter.
 *
 * Extends `ContextValues` interface. The values are provided by corresponding providers registered with
 * `BootstrapContext.provide()` method.
 *
 * @param <E> A type of HTML element.
 */
export interface ComponentContext<T extends object = object, E extends HTMLElement = HTMLElement>
    extends ContextValues {

  /**
   * Custom HTML element constructed for the component according to its type.
   */
  readonly element: E;

  /**
   * Whether the custom HTML element is connected.
   *
   * This becomes `true` right before `onConnect` is called, and becomes false right before `onDisconnect` is called.
   */
  readonly connected: boolean;

  /**
   * A promise resolved to component.
   *
   * The component is constructed shortly after the HTML element. So the component may not exist when requested
   * e.g. inside component constructor, or inside `ElementListener`.
   */
  readonly component: Promise<T>;

  /**
   * Registers custom HTML element connection listener.
   *
   * This listener will be called when custom element is connected, i.e. its `connectedCallback()` method is called.
   *
   * @param listener A listener to notify on element connection.
   *
   * @return An event interest instance.
   */
  readonly onConnect: EventProducer<(this: this) => void>;

  /**
   * Registers custom HTML element disconnection listener.
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
   * Updates the state of web component.
   *
   * It is a shorthand for invoking a component state update function available under
   * `[ComponentContext.stateUpdateKey]` key.
   *
   * Note that state update has no effect, unless `StateSupport` feature is enabled.
   *
   * @param <V> A type of changed value.
   * @param key Changed value key.
   * @param newValue New value.
   * @param oldValue Previous value.
   */
  readonly updateState: StateUpdateConsumer;

  /**
   * Returns a `super` property value inherited from custom HTML element parent.
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
 * This function is called at most once per component, unless it returns `null`/`undefined`. In the latter case
 * it may be called again later.
 *
 * @param <S> The type of source value.
 * @param context Target component context.
 *
 * @return Either constructed value, or `null`/`undefined` if the value can not be constructed.
 */
export type ComponentValueProvider<S> =
    <T extends object, E extends HTMLElement>(this: void, context: ComponentContext<T, E>) => S | null | undefined;

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
      new SingleValueKey<StateUpdateConsumer>('state-update', noop);

  /**
   * A key of a custom HTML element property and web component containing a reference to web component context.
   */
  export const symbol = Symbol('web-component-context');

  /**
   * Extracts component context from its custom HTML element or from component itself.
   *
   * @param element Custom HTML element instance created for web component or the web component itself.
   *
   * @return Web component context reference stored under `[ComponentContext.symbol]` key.
   *
   * @throws TypeError When the given `element` does not contain component context reference.
   */
  export function of<T extends object, E extends HTMLElement>(element: E | T): ComponentContext<T, E> {

    const context = (element as any)[symbol];

    if (!context) {
      throw TypeError(`No component context found in ${element}`);
    }

    return context;
  }

}
