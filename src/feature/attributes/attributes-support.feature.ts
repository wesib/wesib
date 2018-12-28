import { Feature } from '../feature.decorator';
import { AttributeChangedCallback, AttributeRegistrar } from './attribute-registrar';
import { AttributeRegistry } from './attribute-registry';

/**
 * A feature adding attributes to custom elements.
 *
 * This feature is enabled automatically whenever an `@Attribute`, `@Attributes`, or `@AttributeChanged` decorator
 * applied to component.
 */
@Feature({
  init(context) {
    context.forDefinitions({ as: AttributeRegistry });
    context.forDefinitions({
      a: AttributeRegistrar,
      by(registry: AttributeRegistry<any>) {
        return <T extends object>(name: string, callback: AttributeChangedCallback<T>) =>
            registry.add(name, callback);
      },
      with: [AttributeRegistry],
    });
    context.onDefinition(definitionContext => {
      // Define element prototype attributes
      definitionContext.whenReady(elementType => definitionContext.get(AttributeRegistry).define(elementType));
    });
    context.onComponent(componentContext => {

      const mount = componentContext.mount;

      if (mount) {
        // Mount element attributes
        componentContext.get(AttributeRegistry).mount(mount);
      }
    });
  },
})
export class AttributesSupport {}
