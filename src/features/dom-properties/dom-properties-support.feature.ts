import { Class } from '../../common';
import { DefinitionContext } from '../../component';
import { BootstrapContext, WesFeature } from '../../feature';
import { DomPropertiesDef } from './dom-properties-def';

@WesFeature({
  configure: enableDomProperties,
})
export class DomPropertiesSupport {
}

function enableDomProperties(this: Class, context: BootstrapContext) {
  context.onDefinition(defineDomProperties);
}

function defineDomProperties<T extends object>(context: DefinitionContext<T>) {

  const props = DomPropertiesDef.of(context.componentType);

  context.whenReady(elementType => {
    Object.defineProperties(elementType.prototype, props);
  });
}
