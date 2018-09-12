import { Class } from '../../common';
import { ComponentClass } from '../component';

/**
 * Component definition context.
 */
export interface DefinitionContext<T extends object> {

  /**
   * Component class constructor.
   */
  componentType: ComponentClass<T>;

  /**
   * Custom element class constructor.
   *
   *  It is an error accessing this property before the element class is created, e.g. from inside of
   *  `DefinitionListener`. In this case you may wish to add a `whenReady()` callback.
   */
  elementType: Class;

  /**
   * Registers component definition readiness callback.
   *
   * The custom element class is not constructed yet when `DefinitionListener` is called. The registered callback will
   * be notified when the custom element class is constructed.
   *
   * If the custom element class is constructed already, the callback will be notified immediately.
   *
   * @param callback A callback to notify on custom element class construction.
   */
  whenReady(callback: (this: this, elementType: Class) => void): void;

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
