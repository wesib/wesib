import { html__naming } from '@frontmeans/namespace-aliaser';
import { ContextKey, SingleContextKey } from '@proc7ts/context-values';
import { BootstrapContext, bootstrapDefault } from '../../boot';
import { BootstrapWindow, DefaultNamespaceAliaser } from '../../boot/globals';
import { ComponentDef } from '../component-def';
import { ComponentClass } from './component-class';
import { ElementDef } from './element-def';

/**
 * Component element naming service.
 */
export interface ElementNaming {

  /**
   * Obtains element definition of the given component.
   *
   * @param componentType - Target component class.
   *
   * @returns Element definition meta.
   */
  elementOf(componentType: ComponentClass): ElementDef;

}

/**
 * A key of bootstrap context value containing an element naming service instance.
 */
export const ElementNaming: ContextKey<ElementNaming> = (/*#__PURE__*/ new SingleContextKey<ElementNaming>(
    'element-naming',
    {
      byDefault: bootstrapDefault(newElementNaming),
    },
));

function newElementNaming(bsContext: BootstrapContext): ElementNaming {

  const bsWindow = bsContext.get(BootstrapWindow);
  const nsAlias = bsContext.get(DefaultNamespaceAliaser);

  return {
    elementOf(componentType: ComponentClass): ElementDef {

      const { name, extend } = ComponentDef.of(componentType);
      let tagName: string | undefined;

      const elementExtend: ElementDef.Extend = {
        get type() {
          return extend && extend.type || bsWindow.HTMLElement;
        },
        get name() {
          return extend && extend.name;
        },
      };

      return {
        get name() {
          return name;
        },
        get tagName() {
          return tagName || (name && (tagName = html__naming.name(name, nsAlias)));
        },
        get extend() {
          return elementExtend;
        },
      };
    },
  };
}
