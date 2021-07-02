import { html__naming, isQualifiedName, QualifiedName } from '@frontmeans/namespace-aliaser';
import { cxDefaultScoped, CxEntry, cxSingle } from '@proc7ts/context-values';
import { Class, hasOwnProperty, newPromiseResolver, PromiseResolver } from '@proc7ts/primitives';
import { BootstrapContext } from '../../boot';
import { BootstrapWindow, DefaultNamespaceAliaser } from '../../globals';
import { definitionContextOf } from '../../impl/definition-context.symbol';
import { ComponentClass } from './component-class';

/**
 * Custom elements registry.
 *
 * This is used to register custom elements.
 *
 * Typically implemented by `window.customElements`.
 *
 * @category Core
 */
export interface CustomElements {

  /**
   * Defines custom element.
   *
   * @param componentTypeOrName - A component class constructor or custom element name. The latter may belong to
   * namespace to avoid naming conflicts.
   * @param elementType - A constructor of custom element to define.
   */
  define(componentTypeOrName: ComponentClass | QualifiedName, elementType: Class): void;

  /**
   * Allows to wait for component definition.
   *
   * This corresponds to `window.customElements.whenDefined()` method.
   *
   * @param componentTypeOrName - Component class constructor or custom element name possibly belonging to some
   * namespace.
   *
   * @return A promise that is resolved when custom element is registered.
   *
   * @throws TypeError If `componentType` does not contain a component definition.
   */
  whenDefined(componentTypeOrName: ComponentClass | QualifiedName): Promise<void>;

}

/**
 * Context entry containing custom elements registry to use.
 *
 * @category Core
 */
export const CustomElements: CxEntry<CustomElements> = {
  perContext: (/*#__PURE__*/ cxDefaultScoped(
      BootstrapContext,
      (/*#__PURE__*/ cxSingle({
        byDefault: CustomElements$create,
      })),
  )),
  toString: () => `[CustomElements]`,
};

/**
 * @internal
 */
function CustomElements$create(target: CxEntry.Target<CustomElements>): CustomElements {

  const customElements: CustomElementRegistry = target.get(BootstrapWindow).customElements;
  const nsAlias = target.get(DefaultNamespaceAliaser);

  class CustomElements$ implements CustomElements {

    define(componentTypeOrName: ComponentClass | QualifiedName, elementType: Class): void {
      if (isQualifiedName(componentTypeOrName)) {
        customElements.define(html__naming.name(componentTypeOrName, nsAlias), elementType);
        return;
      }

      const defContext = definitionContextOf(componentTypeOrName);
      const { tagName, extend } = defContext.elementDef;

      if (!tagName) {
        componentResolver(componentTypeOrName).resolve(undefined);
        return; // Anonymous component.
      }
      if (extend && extend.name) {
        customElements.define(
            tagName,
            elementType,
            {
              extends: extend.name,
            },
        );
      } else {
        customElements.define(tagName, elementType);
      }
    }

    whenDefined(componentTypeOrName: ComponentClass | string): Promise<void> {
      if (isQualifiedName(componentTypeOrName)) {
        return customElements.whenDefined(html__naming.name(componentTypeOrName, nsAlias));
      }

      const defContext = definitionContextOf(componentTypeOrName);
      const { name } = defContext.elementDef;

      if (!name) {
        return componentResolver(componentTypeOrName).promise();
      }

      return customElements.whenDefined(html__naming.name(name, nsAlias));
    }

  }

  return new CustomElements$();
}

/**
 * @internal
 */
const ComponentResolver__symbol = (/*#__PURE__*/ Symbol('ComponentResolver'));

/**
 * @internal
 */
interface CustomComponentClass<T extends object = any> extends ComponentClass<T> {
  [ComponentResolver__symbol]?: PromiseResolver;
}

/**
 * @internal
 */
function componentResolver(componentType: CustomComponentClass): PromiseResolver {
  if (hasOwnProperty(componentType, ComponentResolver__symbol)) {
    return componentType[ComponentResolver__symbol] as PromiseResolver;
  }
  return componentType[ComponentResolver__symbol] = newPromiseResolver();
}
