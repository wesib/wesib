import { Class } from '../../common';
import { Component, ComponentClass } from '../../component';
import { BootstrapContext, WesFeature } from '../../feature';
import { AttributesDef } from './attributes-def';

/**
 * A feature adding attributes to custom elements.
 *
 * This feature is enabled automatically whenever an `@Attribute`, `@Attributes`, or `@AttributeChanged` decorator
 * applied to any component.
 */
@WesFeature({
  configure: enableAttributesSupport,
})
export class AttributesSupport {
}

function enableAttributesSupport(context: BootstrapContext) {
  context.onElementDefinition(defineAttributes);
}

function defineAttributes<T extends object>(
    elementType: Class,
    componentType: ComponentClass<T>) {

  const attrs = AttributesDef.of(componentType);
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
      attrs[name].call(Component.of(this), newValue, oldValue);
    },
  });
}
