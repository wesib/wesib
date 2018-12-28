import { Feature } from '../feature.decorator';
import { DomPropertyRegistrar } from './dom-property-registrar';
import { DomPropertyRegistry } from './dom-property-registry';

/**
 * A feature adding properties to custom elements.
 *
 * This feature is enabled automatically whenever an `@DomProperty decorator applied to component.
 */
@Feature({
  init(context) {
    context.forDefinitions({ as: DomPropertyRegistry });
    context.forDefinitions({
      a: DomPropertyRegistrar,
      by(registry: DomPropertyRegistry) {
        return (propertyKey: PropertyKey, descriptor: PropertyDescriptor) =>
            registry.add(propertyKey, descriptor);
      },
      with: [DomPropertyRegistry],
    });
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
  }
})
export class DomPropertiesSupport {}
