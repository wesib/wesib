/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { FeatureDef, FeatureDef__symbol } from '../feature-def';
import { AttributeRegistry } from './attribute-registry.impl';

/**
 * @internal
 */
const AttributesSupport__feature: FeatureDef = {
  setup(setup) {
    setup.perDefinition({ as: AttributeRegistry });
    setup.onDefinition(definitionContext => {
      // Define element prototype attributes
      definitionContext.whenReady(
          ({ elementType }) => definitionContext.get(AttributeRegistry).define(elementType),
      );
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
