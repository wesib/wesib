import { Class, ContextValueKey, ContextValues, SingleValueKey } from '../../common';
import { BootstrapContext } from '../../feature';
import { ComponentClass } from '../component';
import { ComponentValueProvider } from '../component-context';

/**
 * Component definition context.
 *
 * Extends `ContextValues` interface. The values are provided by corresponding providers registered with
 * `BootstrapContext.forDefinitions()` method.
 *
 * @param <T> A type of component.
 */
export interface DefinitionContext<T extends object> extends ContextValues {

  /**
   * Component class constructor.
   */
  componentType: ComponentClass<T>;

  /**
   * Custom element class constructor.
   *
   *  It is an error accessing this property before the element class is created, e.g. from inside of
   *  `DefinitionListener` or `ComponentDef.define()` function. In these cases you may wish to add a `whenReady()`
   *  callback.
   */
  elementType: Class;

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
  whenReady(callback: (this: this, elementType: Class) => void): void;

  /**
   * Registers provider that associates a value with the given key with components of the defined component type.
   *
   * The given provider will be requested for the value at most once per component.
   *
   * @param <S> The type of source value.
   * @param key Component context value key the provider should associate the value with.
   * @param provider Component context value provider to register.
   */
  forComponents<S>(key: ContextValueKey<any, S>, provider: ComponentValueProvider<S>): void;

}

/**
 * Component definition context value provider.
 *
 * It is responsible for constructing the values associated with particular key for each component type.
 *
 * This function is called at most once per component type.
 *
 * @param <S> The type of source value.
 * @param context Target component definition context.
 *
 * @return Either constructed value, or `null`/`undefined` if the value can not be constructed.
 */
export type DefinitionValueProvider<S> =
    <T extends object>(this: void, context: DefinitionContext<T>) => S | null | undefined;

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

export namespace DefinitionContext {

  /**
   * A key of context value containing a base element class constructor.
   *
   * This value is the class the custom elements are inherited from unless `ComponentDef.extends.type` is specified.
   *
   * Target value defaults to `HTMLElement` from the window provided under `windowKey`.
   */
  export const baseElementKey = new SingleValueKey<Class>(
      'base-element',
      values => (values.get(BootstrapContext.windowKey) as any).HTMLElement);

}
