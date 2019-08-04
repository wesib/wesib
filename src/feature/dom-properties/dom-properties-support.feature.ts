/**
 * @module @wesib/wesib
 */
import { FeatureDef, FeatureDef__symbol } from '../feature-def';
import { DomPropertyRegistrar } from './dom-property-registrar';
import { DomPropertyRegistry } from './dom-property-registry.impl';

const DomPropertiesSupport__feature: FeatureDef = {
  perDefinition: [
    { as: DomPropertyRegistry },
    {
      a: DomPropertyRegistrar,
      by(registry: DomPropertyRegistry) {
        return (propertyKey: PropertyKey, descriptor: PropertyDescriptor) =>
            registry.add(propertyKey, descriptor);
      },
      with: [DomPropertyRegistry],
    },
  ],
  init(context) {
    context.onDefinition(definitionContext => {
      // Define element prototype properties
      definitionContext.whenReady(elementType => definitionContext.get(DomPropertyRegistry).define(elementType));
    });
    context.onComponent(componentContext => {

      const mount = componentContext.mount;

      if (mount) {
        // Mount element properties
        componentContext.get(DomPropertyRegistry).mount(mount);
      }
    });
  },
};

/**
 * A feature adding properties to custom elements.
 *
 * This feature is enabled automatically whenever an `@DomProperty decorator applied to component.
 */
export class DomPropertiesSupport {

  static get [FeatureDef__symbol]() {
    return DomPropertiesSupport__feature;
  }

}
