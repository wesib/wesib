import { ContextKey, ContextValues, ContextValueSpec } from 'context-values';
import { OnEvent } from 'fun-events';
import { Class } from '../../common';
import { ComponentClass } from '../component-class';
import { ComponentContext } from '../component-context';
import { DefinitionContext__key } from './definition.context.key';
import { ElementDef } from './element-def';

/**
 * Component definition context.
 *
 * Extends `ContextValues` interface. The values are provided by corresponding providers registered with
 * `BootstrapContext.perDefinition()` method. All `BootstrapContext` values are available too.
 *
 * @typeparam T A type of component.
 */
export abstract class DefinitionContext<T extends object = any> extends ContextValues {

  /**
   * A key of definition context value containing the definition context itself.
   */
  static get key(): ContextKey<DefinitionContext> {
    return DefinitionContext__key;
  }

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
   * Custom element definition.
   */
  get elementDef(): ElementDef {
    return this.get(ElementDef);
  }

  /**
   * Registers component construction listener.
   *
   * This listener will be called right before the defined component is constructed.
   *
   * @param listener A listener to notify on each defined component construction.
   *
   * @return An event interest instance.
   */
  abstract readonly onComponent: OnEvent<[ComponentContext]>;

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
   * @typeparam D A type of dependencies.
   * @typeparam S The type of context value sources.
   * @param spec Component context value specifier.
   */
  abstract perComponent<S>(spec: ContextValueSpec<ComponentContext<T>, any, any[], S>): void;

}
