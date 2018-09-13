import { mergeFunctions } from '../../common';
import { Component, DefinitionContext } from '../../component';
import { BootstrapContext, WesFeature } from '../../feature';
import { AttributeChangedCallback, AttributeRegistry as AttributeRegistry_ } from './attribute-registry';

/**
 * A feature adding attributes to custom elements.
 *
 * This feature is enabled automatically whenever an `@Attribute`, `@Attributes`, or `@AttributeChanged` decorator
 * applied to any component.
 */
@WesFeature({
  bootstrap: enableAttributesSupport,
})
export class AttributesSupport {
}

function enableAttributesSupport(context: BootstrapContext) {
  context.onDefinition(<T extends object>(defContext: DefinitionContext<T>) => {

    const attrs: { [name: string]: AttributeChangedCallback<any> } = {};

    defContext.forComponents(AttributeRegistry_.key, () => {

      class AttributeRegistry implements AttributeRegistry_<T> {

        onAttributeChange(name: string, callback: AttributeChangedCallback<T>): void {
          attrs[name] = mergeFunctions<[string, string | null], void, T>(attrs[name], callback);
        }

      }

      return new AttributeRegistry();
    });

    defContext.whenReady(() => defineAttributes(defContext, attrs));
  });
}

function defineAttributes<T extends object>(
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
