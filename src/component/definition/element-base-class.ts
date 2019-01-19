import { ContextKey } from 'context-values';
import { Class } from '../../common';
import { elementBaseClassKey } from './element-base-class.key';

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
  export const key: ContextKey<ElementBaseClass> = elementBaseClassKey;

}
