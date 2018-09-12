import { Class } from '../../common';
import { ComponentClass } from '../../component';
import { BootstrapContext, WesFeature } from '../../feature';
import { DomPropertiesDef } from './dom-properties-def';

@WesFeature({
  configure: enableDomProperties,
})
export class DomPropertiesSupport {
}

function enableDomProperties(this: Class, context: BootstrapContext) {
  context.onElementDefinition(defineDomProperties);
}

function defineDomProperties<T extends object>(
    elementType: Class,
    componentType: ComponentClass<T>) {

  const props = DomPropertiesDef.of(componentType);

  Object.defineProperties(elementType.prototype, props);
}
