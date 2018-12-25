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

          define(componentType: ComponentClass, elementType: Class): void {

            const def = ComponentDef.of(componentType);
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

          whenDefined(componentType: ComponentClass): Promise<void> {

            const def = ComponentDef.of(componentType);

            return customElements.whenDefined(def.name);
          }

        }

        return new WindowCustomElements();
      });

  /**
   * Defines custom element.
   *
   * @param componentType A component class constructor.
   * @param elementType A constructor of custom element class defined for `componentType`.
   */
  abstract define(componentType: ComponentClass<any>, elementType: Class<any>): void;

  /**
   * Allows to wait for component definition.
   *
   * This corresponds to `window.customElements.whenDefined()` method.
   *
   * @param componentType Component class constructor.
   *
   * @return A promise that is resolved when the given `componentType` is registered.
   *
   * @throws TypeError If `componentType` does not contain a component definition.
   */
  abstract whenDefined(componentType: ComponentClass<any>): Promise<void>;

}
