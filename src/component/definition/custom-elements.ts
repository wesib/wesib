/**
 * @module @wesib/wesib
 */
import { ContextKey, ContextKey__symbol, ContextValues, SingleContextKey } from 'context-values';
import { html__naming, isQualifiedName, QualifiedName } from 'namespace-aliaser';
import { Class, PromiseResolver } from '../../common';
import { BootstrapWindow, DefaultNamespaceAliaser } from '../../kit';
import { componentFactoryOf } from '../../kit/definition/component-factory.symbol.impl';
import { ComponentClass } from '../component-class';

const CustomElements__key = /*#__PURE__*/ new SingleContextKey<CustomElements>(
    'custom-elements',
    {
      byDefault: createCustomElements,
    },
);

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
   * @param componentTypeOrName  A component class constructor or custom element name. The latter may belong to
   * namespace to avoid naming conflicts.
   * @param elementType  A constructor of custom element to define.
   */
  abstract define(componentTypeOrName: ComponentClass | QualifiedName, elementType: Class): void;

  /**
   * Allows to wait for component definition.
   *
   * This corresponds to `window.customElements.whenDefined()` method.
   *
   * @param componentTypeOrName  Component class constructor or custom element name possibly belonging to some
   * namespace.
   *
   * @return A promise that is resolved when custom element is registered.
   *
   * @throws TypeError If `componentType` does not contain a component definition.
   */
  abstract whenDefined(componentTypeOrName: ComponentClass | QualifiedName): Promise<void>;

}

function createCustomElements(values: ContextValues) {

  const customElements: CustomElementRegistry = values.get(BootstrapWindow).customElements;
  const nsAlias = values.get(DefaultNamespaceAliaser);

  class WindowCustomElements extends CustomElements {

    define(componentTypeOrName: ComponentClass | string, elementType: Class): void {
      if (isQualifiedName(componentTypeOrName)) {
        customElements.define(html__naming.name(componentTypeOrName, nsAlias), elementType);
        return;
      }

      const factory = componentFactoryOf(componentTypeOrName);
      const { name, extend } = factory.elementDef;

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
            });
      } else {
        customElements.define(html__naming.name(name, nsAlias), elementType);
      }
    }

    whenDefined(componentTypeOrName: ComponentClass | string): Promise<void> {
      if (isQualifiedName(componentTypeOrName)) {
        return customElements.whenDefined(html__naming.name(componentTypeOrName, nsAlias));
      }

      const factory = componentFactoryOf(componentTypeOrName);
      const { name } = factory.elementDef;

      if (!name) {
        return componentResolver(componentTypeOrName).promise;
      }

      return customElements.whenDefined(html__naming.name(name, nsAlias));
    }

  }

  return new WindowCustomElements();
}

const ComponentResolver__symbol = /*#__PURE__*/ Symbol('component-resolver');

function componentResolver(componentType: ComponentClass): PromiseResolver<void> {
  return (componentType as any)[ComponentResolver__symbol]
      || ((componentType as any)[ComponentResolver__symbol] = new PromiseResolver());
}
