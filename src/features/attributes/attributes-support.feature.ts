import { mergeFunctions } from '../../common';
import { Component, DefinitionContext } from '../../component';
import { WesFeature } from '../../feature';
import { AttributeChangedCallback, AttributeRegistry as AttributeRegistry_ } from './attribute-registry';

/**
 * A feature adding attributes to custom elements.
 *
 * This feature is enabled automatically whenever an `@Attribute`, `@Attributes`, or `@AttributeChanged` decorator
 * applied to component.
 */
@WesFeature({
  bootstrap(context) {
    context.onDefinition(defineAttributes);
  },
})
export class AttributesSupport {}

function defineAttributes<T extends object>(context: DefinitionContext<T>) {

  const attrs: { [name: string]: AttributeChangedCallback<any> } = {};

  context.forComponents(AttributeRegistry_.key, () => {

    class AttributeRegistry implements AttributeRegistry_<T> {

      onAttributeChange(name: string, callback: AttributeChangedCallback<T>): void {
        attrs[name] = mergeFunctions<[string, string | null], void, T>(attrs[name], callback);
      }

    }

    return new AttributeRegistry();
  });

  context.whenReady(() => declareAttributes(context, attrs));
}

function declareAttributes<T extends object>(
    context: DefinitionContext<T>,
    attrs: { [name: string]: AttributeChangedCallback<any> }) {

  const observedAttributes = Object.keys(attrs);

  if (!observedAttributes.length) {
    return; // No attributes defined
  }

  context.whenReady(elementType => {
    Object.defineProperty(elementType, 'observedAttributes', {
      configurable: true,
      enumerable: true,
      value: observedAttributes,
    });
    Object.defineProperty(elementType.prototype, 'attributeChangedCallback', {
      configurable: true,
      enumerable: true,
      value: function (name: string, oldValue: string | null, newValue: string) {
        attrs[name].call(Component.of(this), newValue, oldValue);
      },
    });
  });
}
