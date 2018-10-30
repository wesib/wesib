import {
  ContextValueKey,
  ContextValueRequest,
  ContextValues,
  EventProducer,
  SingleValueKey,
  StatePath,
  StateUpdater,
} from '../common';
import { ComponentClass } from './component-class';

const componentContextKey: ContextValueKey<ComponentContext<any>> = new SingleValueKey('component-context');
const contentRootKey: ContextValueKey<ContentRoot> = new SingleValueKey(
    'content-root',
    ctx => ctx.get(componentContextKey).element);

/**
 * Component context.
 *
 * Passed to component constructor as its only parameter.
 *
 * Extends `ContextValues` interface. The values are provided by corresponding providers registered with
 * `BootstrapContext.forComponents()` method.
 *
 * @param <T> A type of component.
 */
export abstract class ComponentContext<T extends object = object> implements ContextValues {

  /**
   * A key of a custom element and component properties containing a reference to component context.
   */
  static readonly symbol = Symbol('component-context');

  /**
   * A key of component context value containing a component context instance itself.
   *
   * It is useful e.g. when constructing default context values relying on context instance.
   */
  static readonly key = componentContextKey;

  /**
   * Component class constructor.
   */
  abstract readonly componentType: ComponentClass<T>;

  /**
   * Custom element constructed for the component according to its type.
   *
   * E.g. `HTMLElement` instance.
   */
  abstract readonly element: any;

  /**
   * A component instance.
   *
   * It is an error accessing this property before the component is created, e.g. from inside of `ComponentListener`
   * or component constructor. In these cases you may wish to add a `whenReady()` callback.
   */
  abstract readonly component: T;

  /**
   * Whether the custom element is connected.
   *
   * This becomes `true` right before `onConnect` is called, and becomes false right before `onDisconnect` is called.
   */
  abstract readonly connected: boolean;

  /**
   * Registers custom element connection listener.
   *
   * This listener will be called when custom element is connected, i.e. its `connectedCallback()` method is called.
   *
   * @param listener A listener to notify on element connection.
   *
   * @return An event interest instance.
   */
  abstract readonly onConnect: EventProducer<(this: this) => void>;

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
  abstract readonly onDisconnect: EventProducer<(this: this) => void>;

  /**
   * Updates component's state.
   *
   * This is a shorthand for invoking a component state update function available under `[StateUpdater.key]` key.
   *
   * Note that state update has no effect unless `StateSupport` feature is enabled or `[StateUpdater.key]` context value
   * is provided by other means.
   *
   * @param <V> A type of changed value.
   * @param key Changed value key.
   * @param newValue New value.
   * @param oldValue Previous value.
   */
  readonly updateState: StateUpdater = (<V>(key: StatePath, newValue: V, oldValue: V) => {
    this.get(StateUpdater)(key, newValue, oldValue);
  });

  /**
   * Extracts component context from its custom element or from component itself.
   *
   * @param element Custom element instance created for the component or the component itself.
   *
   * @return Component context reference stored under `[ComponentContext.symbol]` key.
   *
   * @throws TypeError When the given `element` does not contain component context reference.
   */
  static of<T extends object>(element: any): ComponentContext<T> {

    const context = element[ComponentContext.symbol];

    if (!context) {
      throw TypeError(`No component context found in ${element}`);
    }

    return context;
  }

  /**
   * Component content root.
   *
   * This is a shorthand for requesting content root instance available under `[ContentRoot.key]` key.
   */
  get contentRoot(): ParentNode {
    return this.get(contentRootKey);
  }

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
  abstract whenReady(callback: (this: this, component: T) => void): void;

  /**
   * Returns a `super` property value inherited from custom element parent.
   *
   * @param name Target property name.
   */
  abstract elementSuper(name: string): any;

  abstract get<V>(request: ContextValueRequest<V>, defaultValue?: V): V;

  abstract get<V>(request: ContextValueRequest<V>, defaultValue: V | null): V | null;

  abstract get<V>(request: ContextValueRequest<V>, defaultValue: V | undefined): V | undefined;

  /**
   * Returns a value associated with the given key.
   *
   * @param <V> A type of associated value.
   * @param request Context value request with target key.
   * @param defaultValue Default value to return if there is no value associated with the given key. Can be `null`
   * or `undefined` too.
   *
   * @returns Associated value.
   *
   * @throws Error If there is no value associated with the given key and the default key is not provided neither
   * as function argument, nor as `ContextValueKey.defaultValue` property.
   */
  abstract get<V>(request: ContextValueRequest<V>, defaultValue: V | null | undefined): V | null | undefined;

}

/**
 * Component content root node.
 */
export type ContentRoot = ParentNode;

export namespace ContentRoot {

  /**
   * A key of component context value containing a component root element.
   *
   * This is an element itself by default. But can be overridden e.g. by `@AttachShadow` decorator.
   */
  export const key = contentRootKey;

}

/**
 * Component construction listener.
 *
 * It is notified on new component instance construction when registered with `BootstrapContext.onComponent()`
 * method.
 *
 * @param context Component context.
 */
export type ComponentListener = <T extends object>(this: void, context: ComponentContext<T>) => void;
