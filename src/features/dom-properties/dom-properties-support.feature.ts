import { Class } from '../../common';
import { SingleValueKey } from '../../common/context';
import { WesFeature } from '../../feature';
import { DomPropertyRegistry as DomPropertyRegistry_ } from './dom-property-registry';

class DomPropertyRegistry implements DomPropertyRegistry_ {

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

const implKey = new SingleValueKey<DomPropertyRegistry>('dom-property-registry:impl');

/**
 * A feature adding properties to custom elements.
 *
 * This feature is enabled automatically whenever an `@DomProperty decorator applied to component.
 */
@WesFeature({
  bootstrap(context) {
    context.forDefinitions(implKey, () => new DomPropertyRegistry());
    context.forDefinitions(DomPropertyRegistry_.key, ctx => ctx.get(implKey));
    context.onDefinition(defContext =>
        defContext.whenReady(elementType => defContext.get(implKey).apply(elementType)));
  }
})
export class DomPropertiesSupport {}
