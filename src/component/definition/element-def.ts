/**
 * @module @wesib/wesib
 */
import { ContextRequest, ContextTarget, SingleContextKey } from 'context-values';
import { QualifiedName } from 'namespace-aliaser';
import { Class } from '../../common';
import { BootstrapWindow } from '../../kit';
import { ComponentDef } from '../component-def';
import { DefinitionContext__key } from './definition.context.key.impl';

/**
 * Custom element definition meta.
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
  readonly name?: QualifiedName;

  /**
   * Existing element to extend by custom one.
   */
  readonly extend: Readonly<ElementDef.Extend>;

}

/**
 * A key of definition context value containing a custom element definition.
 *
 * Target value defaults to `HTMLElement` from the window provided under `[BootstrapWindow.key]`,
 * unless `ComponentDef.extend.type` is specified.
 */
export const ElementDef: ContextTarget<ElementDef> & ContextRequest<ElementDef> =
    /*#__PURE__*/ new SingleContextKey<ElementDef>(
    'element-def',
    values => {

      const componentType = values.get(DefinitionContext__key).componentType;
      const { name, extend } = ComponentDef.of(componentType);

      const elementExtend: ElementDef.Extend = {
        get type() {
          return extend && extend.type || (values.get(BootstrapWindow) as any).HTMLElement;
        },
        get name() {
          return extend && extend.name;
        }
      };

      return {
        get name() {
          return name;
        },
        get extend() {
          return elementExtend;
        },
      };
    });

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
    readonly name?: string;

  }

}
