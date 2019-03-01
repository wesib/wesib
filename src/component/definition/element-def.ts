import { ContextKey } from 'context-values';
import { Class } from '../../common';
import { ElementDef__key } from './element-def.key';

/**
 * Custom element definition meta.
 */
export interface ElementDef {

  /**
   * Custom element name.
   *
   * When omitted an anonymous component will be registered. Such component is not bound to custom element, but it
   * still can be mounted.
   */
  readonly name?: string;

  /**
   * Existing element to extend by custom one.
   */
  readonly extend: Readonly<ElementDef.Extend>;

}

export const ElementDef = {

  /**
   * A key of definition context value containing a custom element definition.
   *
   * Target value defaults to `HTMLElement` from the window provided under `[BootstrapWindow.key]`,
   * unless `ComponentDef.extend.type` is specified.
   */
  get key(): ContextKey<ElementDef> {
    return ElementDef__key;
  }

};

export namespace ElementDef {

  /**
   * The definition of element to extend by custom one.
   */
  export interface Extend {

    /**
     * The class constructor of element to extend.
     */
    type: Class;

    /**
     * The name of element to extend.
     *
     * This is to support `as` attribute of standard HTML element. Note that this is not supported by polyfills.
     */
    name?: string;

  }

}
