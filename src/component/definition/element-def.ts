import { QualifiedName } from '@frontmeans/namespace-aliaser';
import { SingleContextKey, SingleContextRef } from '@proc7ts/context-values';
import { Class } from '@proc7ts/primitives';
import { DefinitionContext__key } from './definition.context.key.impl';
import { ElementNaming } from './element-naming';

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
 * A key of definition context value containing a custom element definition.
 *
 * Target value defaults to `HTMLElement` from the window provided under `[BootstrapWindow.key]`,
 * unless `ComponentDef.extend.type` is specified.
 *
 * @category Core
 */
export const ElementDef: SingleContextRef<ElementDef> = (/*#__PURE__*/ new SingleContextKey<ElementDef>(
    'element-def',
    {
      byDefault(values) {
        return values.get(ElementNaming).elementOf(values.get(DefinitionContext__key).componentType);
      },
    },
));

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
    readonly name?: string;

  }

}
