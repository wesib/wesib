import { ContextKey, ContextValues, ContextValueSpec } from 'context-values';
import { EventProducer } from 'fun-events';
import { Class } from '../../common';
import { ComponentClass } from '../component-class';
import { ComponentContext } from '../component-context';
import { definitionContextKey } from './definition-context.key';

/**
 * Component definition context.
 *
 * Extends `ContextValues` interface. The values are provided by corresponding providers registered with
 * `BootstrapContext.forDefinitions()` method. All `BootstrapContext` values are available too.
 *
 * @param <T> A type of component.
 */
export abstract class DefinitionContext<T extends object = object> extends ContextValues {

  /**
   * A key of definition context value containing the definition context itself.
   */
  static readonly key: ContextKey<DefinitionContext<any>> = definitionContextKey;

  /**
   * Component class constructor.
   */
  abstract readonly componentType: ComponentClass<T>;

  /**
   * Custom element class constructor.
   *
   * It is an error accessing this property before the element class is created, e.g. from inside of
   * `DefinitionListener` or `ComponentDef.define()` function. In these cases you may wish to add a `whenReady()`
   * callback.
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
  abstract readonly onComponent: EventProducer<[ComponentContext<any>]>;

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
   * Provides a value available in the context of each component of the defined component type.
   *
   * @param <D> A type of dependencies.
   * @param <S> The type of context value sources.
   * @param spec Component context value specifier.
   */
  abstract forComponents<S>(spec: ContextValueSpec<ComponentContext<T>, any, any[], S>): void;

}
