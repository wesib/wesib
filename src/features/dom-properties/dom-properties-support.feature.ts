import { Class } from '../../common';
import { SingleContextKey } from '../../common/context';
import { DefinitionContext } from '../../component/definition';
import { Feature } from '../../feature';
import { DomPropertyRegistrar } from './dom-property-registrar';

class DomPropertyRegistry {

  static readonly key = new SingleContextKey<DomPropertyRegistry>('dom-property-registry');

  private readonly _props = new Map<PropertyKey, PropertyDescriptor>();

  domProperty(propertyKey: PropertyKey, descriptor: PropertyDescriptor): void {
    this._props.set(propertyKey, descriptor);
  }

  apply(elementType: Class) {
    this._props.forEach((desc, key) => {
      Object.defineProperty(elementType.prototype, key, desc);
    });
  }

}

/**
 * A feature adding properties to custom elements.
 *
 * This feature is enabled automatically whenever an `@DomProperty decorator applied to component.
 */
@Feature({
  bootstrap(context) {
    context.forDefinitions({ a: DomPropertyRegistry });
    context.forDefinitions({
      a: DomPropertyRegistrar,
      by(registry: DomPropertyRegistry) {
        return (propertyKey: PropertyKey, descriptor: PropertyDescriptor) =>
            registry.domProperty(propertyKey, descriptor);
      },
      with: [DomPropertyRegistry],
    });
    context.onDefinition(ctx => ctx.whenReady(elementType => ctx.get(DomPropertyRegistry).apply(elementType)));
  }
})
export class DomPropertiesSupport {}
