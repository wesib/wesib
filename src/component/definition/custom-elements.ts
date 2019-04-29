import { ContextKey, ContextValues, SingleContextKey } from 'context-values';
import { Class, PromiseResolver } from '../../common';
import { BootstrapWindow } from '../../kit';
import { componentFactoryOf } from '../../kit/definition/component-factory.symbol';
import { ComponentClass } from '../component-class';

const CustomElements__key =
    /*#__PURE__*/ new SingleContextKey<CustomElements>('custom-elements', createCustomElements);

/**
 * Custom elements registry.
 *
 * This is used to register custom elements.
 *
 * Typically implemented by `window.customElements`.
 */
export abstract class CustomElements {

  /**
   * A key of bootstrap context value containing a `CustomElements` instance used to register custom
   * elements.
   *
   * Target value defaults to `window.customElements` from the window provided under `[BootstrapWindow.key]`.
   */
  static get key(): ContextKey<CustomElements> {
    return CustomElements__key;
  }

  /**
   * Defines custom element.
   *
   * @param componentTypeOrName A component class constructor or custom element name.
   * @param elementType A constructor of custom element to define.
   */
  abstract define(componentTypeOrName: ComponentClass | string, elementType: Class): void;

  /**
   * Allows to wait for component definition.
   *
   * This corresponds to `window.customElements.whenDefined()` method.
   *
   * @param componentTypeOrName Component class constructor or custom element name.
   *
   * @return A promise that is resolved when custom element is registered.
   *
   * @throws TypeError If `componentType` does not contain a component definition.
   */
  abstract whenDefined(componentTypeOrName: ComponentClass | string): Promise<void>;

}

function createCustomElements(values: ContextValues) {

  const customElements = values.get(BootstrapWindow).customElements;

  class WindowCustomElements extends CustomElements {

    define(componentTypeOrName: ComponentClass | string, elementType: Class): void {
      if (typeof componentTypeOrName === 'string') {
        customElements.define(componentTypeOrName, elementType);
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
            name,
            elementType,
            {
              extends: extend.name,
            });
      } else {
        customElements.define(name, elementType);
      }
    }

    whenDefined(componentTypeOrName: ComponentClass | string): Promise<void> {
      if (typeof componentTypeOrName === 'string') {
        return customElements.whenDefined(componentTypeOrName);
      }

      const factory = componentFactoryOf(componentTypeOrName);
      const { name } = factory.elementDef;

      if (!name) {
        return componentResolver(componentTypeOrName).promise;
      }

      return customElements.whenDefined(name);
    }

  }

  return new WindowCustomElements();
}

const ComponentResolver__symbol = /*#__PURE__*/ Symbol('component-resolver');

function componentResolver(componentType: ComponentClass): PromiseResolver<void> {
  return (componentType as any)[ComponentResolver__symbol]
      || ((componentType as any)[ComponentResolver__symbol] = new PromiseResolver());
}
