import { Component, ComponentElementType, ComponentType } from '../../component';
import { WebFeature } from '../../decorators';
import { ElementClass } from '../../element';
import { BootstrapContext } from '../../feature';
import { AttributesDef } from './attributes-def';

/**
 * Web components feature adding support for custom HTML element's attributes changes notifications.
 *
 * This feature is enabled automatically whenever an `@AttributeChanged` decorator applied to web component.
 */
@WebFeature({
  configure: enableAttributesSupport,
})
export class AttributesSupport {
}

function enableAttributesSupport(context: BootstrapContext) {
  context.onElementDefinition(addAttributesSupport);
}

function addAttributesSupport<T extends object>(
    elementType: ElementClass<ComponentElementType<T>>,
    componentType: ComponentType<T>) {

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
    value: function (this: ComponentElementType<T>, name: string, oldValue: string | null, newValue: string) {
      attrs[name].call(Component.of(this), oldValue, newValue);
    },
  });
}
