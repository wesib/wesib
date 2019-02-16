import { FeatureDef } from '../feature-def';
import { AttributeChangedCallback, AttributeRegistrar } from './attribute-registrar';
import { AttributeRegistry } from './attribute-registry';

const DEF: FeatureDef = {
  forDefinitions: [
    { as: AttributeRegistry },
    {
      a: AttributeRegistrar,
      by(registry: AttributeRegistry<any>) {
        return <T extends object>(name: string, callback: AttributeChangedCallback<T>) =>
            registry.add(name, callback);
      },
      with: [AttributeRegistry],
    },
  ],
  init(context) {
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
};

/**
 * A feature adding attributes to custom elements.
 *
 * This feature is enabled automatically whenever an `@Attribute`, `@Attributes`, or `@AttributeChanged` decorator
 * applied to component.
 */
export class AttributesSupport {

  static get [FeatureDef.symbol](): FeatureDef {
    return DEF;
  }

}
