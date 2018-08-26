import { Component } from '../../component';
import { WebFeature } from '../../decorators';
import { ElementClass } from '../../element';
import { BootstrapContext } from '../../feature';
import { AttributesDef, ComponentWithAttributesType } from './attributes-def';

/**
 * Web components feature adding support for custom HTML element's attributes changes notifications.
 *
 * This feature is enabled automatically whenever an `@AttributeChanged` decorator applied to web component.
 */
@WebFeature({
  configure: enableAttributesSupport,
})
export class AttributesSupportFeature {
}

function enableAttributesSupport(context: BootstrapContext) {
  context.onElementDefinition(addAttributesSupport);
}

function addAttributesSupport<T extends object, E extends HTMLElement>(
    elementType: ElementClass<E>,
    componentType: ComponentWithAttributesType<T, E>) {

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
    value: function (this: E, name: string, oldValue: string | null, newValue: string) {
      attrs[name].call(Component.of(this), oldValue, newValue);
    },
  });
}
