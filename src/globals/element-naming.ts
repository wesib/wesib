import { html__naming } from '@frontmeans/namespace-aliaser';
import { CxEntry, cxScoped, cxSingle } from '@proc7ts/context-values';
import { BootstrapContext } from '../boot';
import { ComponentDef } from '../component';
import { ComponentClass, ElementDef } from '../component/definition';
import { BootstrapWindow } from './bootstrap-window';
import { DefaultNamespaceAliaser } from './default-namespace-aliaser';

/**
 * Component element naming service.
 *
 * @category Core
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
 * Bootstrap context entry containing element naming service instance.
 *
 * @category Core
 */
export const ElementNaming: CxEntry<ElementNaming> = {
  perContext: (/*#__PURE__*/ cxScoped(
      BootstrapContext,
      (/*#__PURE__*/ cxSingle({
        byDefault: ElementNaming$byDefault,
      })),
  )),
  toString: () => '[ElementNaming]',
};

function ElementNaming$byDefault(target: CxEntry.Target<ElementNaming>): ElementNaming {

  const bsWindow = target.get(BootstrapWindow);
  const nsAlias = target.get(DefaultNamespaceAliaser);

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
