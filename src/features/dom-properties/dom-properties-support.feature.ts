import { DefinitionContext } from '../../component';
import { WesFeature } from '../../feature';
import { DomPropertyRegistry as DomPropertyRegistry_ } from './dom-property-registry';

/**
 * A feature adding properties to custom elements.
 *
 * This feature is enabled automatically whenever an `@DomProperty decorator applied to component.
 */
@WesFeature({
  bootstrap(context) {
    context.onDefinition(defineDomProperties);
  }
})
export class DomPropertiesSupport {}

function defineDomProperties<T extends object>(context: DefinitionContext<T>) {

  const props = new Map<PropertyKey, PropertyDescriptor>();

  context.forComponents(DomPropertyRegistry_.key, () => {

    class DomPropertyRegistry implements DomPropertyRegistry_ {

      domProperty(propertyKey: PropertyKey, descriptor: PropertyDescriptor): void {
        props.set(propertyKey, descriptor);
      }

    }

    return new DomPropertyRegistry();
  });

  context.whenReady(elementType => {

    const prototype = elementType.prototype;

    props.forEach((desc, key) => {
      Object.defineProperty(prototype, key, desc);
    });
  });
}
