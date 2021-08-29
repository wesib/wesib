import { QualifiedName } from '@frontmeans/namespace-aliaser';
import { Class } from '@proc7ts/primitives';

/**
 * Custom element definition meta.
 *
 * @category Core
 */
export interface ElementDef {

  /**
   * Custom element name.
   *
   * The name may belong to some namespace to avoid naming conflicts. I.e. it can be either a string, or
   * name/namespace tuple.
   *
   * When omitted an anonymous component will be registered. Such component is not bound to custom element, but it
   * still can be mounted.
   */
  readonly name: QualifiedName | undefined;

  /**
   * Resolved custom HTML element's tag name, if any.
   *
   * In contrast to {@link name} this one is always a string.
   */
  readonly tagName: string | undefined;

  /**
   * Existing element to extend by custom one.
   */
  readonly extend: ElementDef.Extend;

}

/**
 * @category Core
 */
export namespace ElementDef {

  /**
   * The definition of element to extend by custom one.
   */
  export interface Extend {

    /**
     * The class constructor of element to extend.
     */
    readonly type: Class;

    /**
     * The name of element to extend.
     *
     * This is to support `as` attribute of standard HTML element. Note that this is not supported by polyfills.
     */
    readonly name?: string | undefined;

  }

}
