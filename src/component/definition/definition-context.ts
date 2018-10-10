import {
  Class,
  ContextValueRequest,
  ContextValues,
  ContextValueSpec,
  EventProducer,
  SingleValueKey,
} from '../../common';
import { BootstrapWindow } from '../../feature';
import { ComponentClass } from '../component';
import { ComponentContext, ComponentListener } from '../component-context';

/**
 * Component definition context.
 *
 * Extends `ContextValues` interface. The values are provided by corresponding providers registered with
 * `BootstrapContext.forDefinitions()` method. All `BootstrapContext` values are available too.
 *
 * @param <T> A type of component.
 */
export abstract class DefinitionContext<T extends object> implements ContextValues {

  /**
   * A key of definition context value containing a base element class constructor.
   *
   * This value is the class the custom elements are inherited from unless `ComponentDef.extend.type` is specified.
   *
   * Target value defaults to `HTMLElement` from the window provided under `[BootstrapWindow.key]`.
   */
  static readonly baseElementKey = new SingleValueKey<Class>(
      'base-element',
      values => (values.get(BootstrapWindow) as any).HTMLElement);

  /**
   * Component class constructor.
   */
  abstract readonly componentType: ComponentClass<T>;

  /**
   * Custom element class constructor.
   *
   *  It is an error accessing this property before the element class is created, e.g. from inside of
   *  `DefinitionListener` or `ComponentDef.define()` function. In these cases you may wish to add a `whenReady()`
   *  callback.
   */
  abstract readonly elementType: Class;

  /**
   * Registers component construction listener.
   *
   * This listener will be called right before the defined component is constructed.
   *
   * @param listener A listener to notify on each defined component construction.
   *
   * @return An event interest instance.
   */
  abstract readonly onComponent: EventProducer<ComponentListener>;

  /**
   * Registers component definition readiness callback.
   *
   * The custom element class is not constructed yet when `DefinitionListener` or `ComponentDef.define()` is called.
   * The registered callback will be notified when the custom element class is constructed.
   *
   * If the custom element class is constructed already, the callback will be notified immediately.
   *
   * @param callback A callback to notify on custom element class construction.
   */
  abstract whenReady(callback: (this: this, elementType: Class) => void): void;

  /**
   * Registers provider that associates a value with the given key with components of the defined component type.
   *
   * The given provider will be requested for the value at most once per component.
   *
   * @param <S> The type of context value sources.
   * @param spec Component context value specifier.
   */
  abstract forComponents<S>(spec: ContextValueSpec<ComponentContext<any>, any, S>): void;

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
 * Component definition listener.
 *
 * It is notified on new component definitions when registered with `BootstrapContext.onDefinition()` method.
 *
 * The listener may alter the component class.
 *
 * @param context Component definition context.
 */
export type DefinitionListener = <T extends object>(this: void, context: DefinitionContext<T>) => void;
