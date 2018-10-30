import { Class, mergeFunctions, SingleValueKey } from '../../common';
import { ComponentContext } from '../../component';
import { Feature } from '../../feature';
import { AttributeChangedCallback, AttributeRegistry as AttributeRegistry_ } from './attribute-registry';

class AttributeRegistry<T extends object> implements AttributeRegistry_<T> {

  static readonly key = new SingleValueKey<AttributeRegistry<any>>('attribute-registry:impl');
  private readonly _attrs: { [name: string]: AttributeChangedCallback<T> } = {};

  onAttributeChange(name: string, callback: AttributeChangedCallback<T>): void {
    this._attrs[name] = mergeFunctions<[string, string | null], void, T>(this._attrs[name], callback);
  }

  apply(elementType: Class) {

    const attrs = this._attrs;
    const observedAttributes = Object.keys(attrs);

    if (!observedAttributes.length) {
      return; // No attributes defined
    }

    Object.defineProperty(elementType, 'observedAttributes', {
      configurable: true,
      enumerable: true,
      value: observedAttributes,
    });
    Object.defineProperty(elementType.prototype, 'attributeChangedCallback', {
      configurable: true,
      enumerable: true,
      value: function (name: string, oldValue: string | null, newValue: string) {
        attrs[name].call(ComponentContext.of(this).component, newValue, oldValue);
      },
    });
  }

}

/**
 * A feature adding attributes to custom elements.
 *
 * This feature is enabled automatically whenever an `@Attribute`, `@Attributes`, or `@AttributeChanged` decorator
 * applied to component.
 */
@Feature({
  bootstrap(context) {
    context.forDefinitions({ provide: AttributeRegistry, provider: () => new AttributeRegistry() });
    context.forDefinitions({ provide: AttributeRegistry_, provider: ctx => ctx.get(AttributeRegistry) });
    context.onDefinition(ctx => ctx.whenReady(elementType => ctx.get(AttributeRegistry).apply(elementType)));
  },
})
export class AttributesSupport {}
