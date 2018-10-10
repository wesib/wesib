import { Class } from '../../common';
import { SingleValueKey } from '../../common/context';
import { WesFeature } from '../../feature';
import { DomPropertyRegistry as DomPropertyRegistry_ } from './dom-property-registry';

class DomPropertyRegistry implements DomPropertyRegistry_ {

  static readonly key = new SingleValueKey<DomPropertyRegistry>('dom-property-registry:impl');

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
@WesFeature({
  bootstrap(context) {
    context.forDefinitions({ provide: DomPropertyRegistry, provider: () => new DomPropertyRegistry() });
    context.forDefinitions({ provide: DomPropertyRegistry_, provider: ctx => ctx.get(DomPropertyRegistry) });
    context.onDefinition(ctx => ctx.whenReady(elementType => ctx.get(DomPropertyRegistry).apply(elementType)));
  }
})
export class DomPropertiesSupport {}
