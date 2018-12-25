import { Class } from '../../common';
import { ComponentClass } from '../component-class';

/**
 * A factory of components of particular type.
 */
export abstract class ComponentFactory<C extends object = object> {

  /**
   * Component class constructor.
   */
  abstract readonly componentType: ComponentClass<C>;

  /**
   * Custom element class constructor.
   */
  abstract readonly elementType: Class;

}
