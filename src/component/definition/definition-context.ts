import { EventProducer } from 'fun-events';
import {
  Class,
  ContextKey,
  ContextRequest,
  ContextValues,
  ContextValueSpec,
  SingleContextKey,
} from '../../common';
import { BootstrapWindow } from '../../feature';
import { ComponentClass } from '../component-class';
import { ComponentContext, ComponentListener } from '../component-context';
import { ComponentDef } from '../component-def';

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
   * A key of definition context value containing a definition context itself.
   */
  static readonly key: ContextKey<DefinitionContext<any>> = new SingleContextKey('definition-context');

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

  /**
   * Returns a value associated with the given key.
   *
   * @param <V> A type of associated value.
   * @param request Context value request with target key.
   * @param opts Context value request options.
   *
   * @returns Associated value or `null` if there is no associated value.
   */
  abstract get<V>(request: ContextRequest<V>, opts: { or: null }): V | null;

  /**
   * Returns a value associated with the given key.
   *
   * @param <V> A type of associated value.
   * @param request Context value request with target key.
   * @param opts Context value request options.
   *
   * @returns Associated value or `null` if there is no associated value.
   */
  abstract get<V>(request: ContextRequest<V>, opts: { or: undefined }): V | undefined;

  /**
   * Returns a value associated with the given key.
   *
   * @param <V> A type of associated value.
   * @param request Context value request with target key.
   * @param opts Context value request options.
   *
   * @returns Associated value.
   *
   * @throws Error If there is no value associated with the given key and the default key is not provided neither
   * as function argument, nor as key default.
   */
  abstract get<V>(request: ContextRequest<V>, opts?: { or: V }): V;

}

/**
 * Base element class constructor.
 */
export type ElementBaseClass<T extends object = object> = Class<T>;

export namespace ElementBaseClass {

  /**
   * A key of definition context value containing a base element class constructor.
   *
   * This value is the class the custom elements are inherited from.
   *
   * Target value defaults to `HTMLElement` from the window provided under `[BootstrapWindow.key]`,
   * unless `ComponentDef.extend.type` is specified.
   */
  export const key = new SingleContextKey<ElementBaseClass>(
      'element-base-class',
      values => {

        const componentType = values.get(DefinitionContext).componentType;
        const extend = ComponentDef.of(componentType).extend;

        return extend && extend.type ||  (values.get(BootstrapWindow) as any).HTMLElement;
      });

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
