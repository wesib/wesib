/**
 * @module @wesib/wesib
 */
import { FeatureDef, FeatureDef__symbol } from '../feature-def';
import { AttributeChangedCallback, AttributeRegistrar } from './attribute-registrar';
import { AttributeRegistry } from './attribute-registry.impl';

const AttributesSupport__feature: FeatureDef = {
  setup(setup) {
    setup.perDefinition({ as: AttributeRegistry });
    setup.perDefinition({
      a: AttributeRegistrar,
      by(registry: AttributeRegistry) {
        return <T extends object>(name: string, callback: AttributeChangedCallback<T>) =>
            registry.add(name, callback);
      },
      with: [AttributeRegistry],
    });
    setup.onDefinition(definitionContext => {
      // Define element prototype attributes
      definitionContext.whenReady(({ elementType }) => definitionContext.get(AttributeRegistry).define(elementType));
    });
    setup.onComponent(componentContext => {

      const mount = componentContext.mount;

      if (mount) {
        // Mount element attributes
        componentContext.get(AttributeRegistry).mount(mount);
      }
    });
  },
};

/**
 * A feature adding attributes to custom elements.
 *
 * This feature is enabled automatically whenever an `@Attribute`, `@Attributes`, or `@AttributeChanged` decorator
 * applied to component.
 *
 * @category Feature
 */
export class AttributesSupport {

  static get [FeatureDef__symbol](): FeatureDef {
    return AttributesSupport__feature;
  }

}
