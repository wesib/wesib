import { ComponentElementType, ComponentType } from '../../component';
import { WebFeature } from '../../decorators';
import { ElementClass } from '../../element';
import { BootstrapContext, FeatureType } from '../../feature';
import { DomPropertiesDef } from './dom-properties-def';

@WebFeature({
  configure: enableDomProperties,
})
export class DomPropertiesSupport {
}

function enableDomProperties(this: FeatureType, context: BootstrapContext) {
  context.onElementDefinition(defineDomProperties);
}

function defineDomProperties<T extends object>(
    elementType: ElementClass<ComponentElementType<T>>,
    componentType: ComponentType<T>) {

  const props = DomPropertiesDef.of(componentType);

  Object.defineProperties(elementType.prototype, props);
}
