/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { FeatureDef, FeatureDef__symbol } from '../feature-def';
import { DomPropertyRegistrar } from './dom-property-registrar';
import { DomPropertyRegistry } from './dom-property-registry.impl';

/**
 * @internal
 */
const DomPropertiesSupport__feature: FeatureDef = {
  setup(setup) {
    setup.perDefinition({ as: DomPropertyRegistry });
    setup.perDefinition({
      a: DomPropertyRegistrar,
      by(registry: DomPropertyRegistry) {
        return (propertyKey: PropertyKey, descriptor: PropertyDescriptor) => registry.add(propertyKey, descriptor);
      },
      with: [DomPropertyRegistry],
    });
    setup.onDefinition(definitionContext => {
      // Define element prototype properties
      definitionContext.whenReady(({ elementType }) => definitionContext.get(DomPropertyRegistry).define(elementType));
    });
    setup.onComponent(componentContext => {

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
 * This feature is enabled automatically whenever a {@link DomProperty @DomProperty} decorator applied to component.
 *
 * @category Feature
 */
export class DomPropertiesSupport {

  static get [FeatureDef__symbol](): FeatureDef {
    return DomPropertiesSupport__feature;
  }

}
