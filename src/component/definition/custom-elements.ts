import { html__naming, isQualifiedName, QualifiedName } from '@frontmeans/namespace-aliaser';
import { ContextKey, ContextKey__symbol, SingleContextKey } from '@proc7ts/context-values';
import { Class, newPromiseResolver, PromiseResolver } from '@proc7ts/primitives';
import { BootstrapContext, bootstrapDefault } from '../../boot';
import { BootstrapWindow, DefaultNamespaceAliaser } from '../../boot/globals';
import { definitionContextOf } from '../../boot/impl/definition-context.symbol.impl';
import { ComponentClass } from './component-class';

/**
 * @internal
 */
const CustomElements__key = (/*#__PURE__*/ new SingleContextKey<CustomElements>(
    'custom-elements',
    {
      byDefault: bootstrapDefault(createCustomElements),
    },
));

/**
 * Custom elements registry.
 *
 * This is used to register custom elements.
 *
 * Typically implemented by `window.customElements`.
 *
 * @category Core
 */
export abstract class CustomElements {

  /**
   * A key of bootstrap context value containing a `CustomElements` instance used to register custom
   * elements.
   *
   * Target value defaults to `window.customElements` from the window provided under `[BootstrapWindow.key]`.
   */
  static get [ContextKey__symbol](): ContextKey<CustomElements> {
    return CustomElements__key;
  }

  /**
   * Defines custom element.
   *
   * @param componentTypeOrName - A component class constructor or custom element name. The latter may belong to
   * namespace to avoid naming conflicts.
   * @param elementType - A constructor of custom element to define.
   */
  abstract define(componentTypeOrName: ComponentClass | QualifiedName, elementType: Class): void;

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
  abstract whenDefined(componentTypeOrName: ComponentClass | QualifiedName): Promise<void>;

}

/**
 * @internal
 */
function createCustomElements(bsContext: BootstrapContext): CustomElements {

  const customElements: CustomElementRegistry = bsContext.get(BootstrapWindow).customElements;
  const nsAlias = bsContext.get(DefaultNamespaceAliaser);

  class CustomElements$ extends CustomElements {

    define(componentTypeOrName: ComponentClass | string, elementType: Class): void {
      if (isQualifiedName(componentTypeOrName)) {
        customElements.define(html__naming.name(componentTypeOrName, nsAlias), elementType);
        return;
      }

      const defContext = definitionContextOf(componentTypeOrName);
      const { name, extend } = defContext.elementDef;

      if (!name) {
        componentResolver(componentTypeOrName).resolve(undefined);
        return; // Anonymous component.
      }
      if (extend && extend.name) {
        customElements.define(
            html__naming.name(name, nsAlias),
            elementType,
            {
              extends: extend.name,
            },
        );
      } else {
        customElements.define(html__naming.name(name, nsAlias), elementType);
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
const ComponentResolver__symbol = (/*#__PURE__*/ Symbol('component-resolver'));

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
  // eslint-disable-next-line no-prototype-builtins
  if (componentType.hasOwnProperty(ComponentResolver__symbol)) {
    return componentType[ComponentResolver__symbol] as PromiseResolver;
  }
  return componentType[ComponentResolver__symbol] = newPromiseResolver();
}
