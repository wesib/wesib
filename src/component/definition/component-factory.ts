import { ContextKey, SingleContextKey } from 'context-values';
import { Class } from '../../common';
import { ComponentClass } from '../component-class';
import { ComponentMount } from '../component-mount';

/**
 * A factory of components of particular type.
 */
export abstract class ComponentFactory<C extends object = object> {

  /**
   * A key of definition context value containing a component factory.
   */
  static readonly key: ContextKey<ComponentFactory<any>> = new SingleContextKey('component-factory');

  /**
   * Component class constructor.
   */
  abstract readonly componentType: ComponentClass<C>;

  /**
   * Custom element class constructor.
   *
   * It is an error accessing this property before the element class is created, e.g. from inside of
   * `DefinitionListener` or `ComponentDef.define()` function. In these cases you may wish to add a `whenReady()`
   * callback.
   */
  abstract readonly elementType: Class;

  /**
   * Mounts a component to arbitrary element.
   *
   * This method creates a component, but instead of creating a custom element for, it mounts it to the target
   * `element`.
   *
   * It is up to the features to update the target element. They can use a `ComponentContext.whenMounted()` callback
   * for that.
   *
   * @param element Target element to mount new component to.
   *
   * @throws Error If target element is already bound to some component.
   */
  abstract mountTo(element: any): ComponentMount<C>;

}
