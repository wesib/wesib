import { ContextKey, SingleContextKey } from 'context-values';
import { Class } from '../../common';
import { BootstrapWindow } from '../../kit';
import { ComponentClass } from '../component-class';
import { ComponentDef } from '../component-def';

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
  static readonly key: ContextKey<CustomElements> = new SingleContextKey<CustomElements>(
      'custom-elements',
      values => {

        const customElements = values.get(BootstrapWindow).customElements;

        class WindowCustomElements extends CustomElements {

          define(componentTypeOrName: ComponentClass<any> | string, elementType: Class): void {
            if (typeof componentTypeOrName === 'string') {
              customElements.define(componentTypeOrName, elementType);
              return;
            }

            const def = ComponentDef.of(componentTypeOrName);

            if (!def.name) {
              return; // Anonymous component.
            }

            const ext = def.extend;

            if (ext && ext.name) {
              customElements.define(
                  def.name,
                  elementType,
                  {
                    extends: ext.name,
                  });
            } else {
              customElements.define(def.name, elementType);
            }
          }

          whenDefined(componentTypeOrName: ComponentClass<any> | string): Promise<void> {
            if (typeof componentTypeOrName === 'string') {
              return customElements.whenDefined(componentTypeOrName);
            }

            const def = ComponentDef.of(componentTypeOrName);

            if (!def.name) {
              return Promise.resolve();
            }

            return customElements.whenDefined(def.name);
          }

        }

        return new WindowCustomElements();
      });

  /**
   * Defines custom element.
   *
   * @param componentTypeOrName A component class constructor or custom element name.
   * @param elementType A constructor of custom element to define.
   */
  abstract define(componentTypeOrName: ComponentClass<any> | string, elementType: Class<any>): void;

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
  abstract whenDefined(componentTypeOrName: ComponentClass<any> | string): Promise<void>;

}
