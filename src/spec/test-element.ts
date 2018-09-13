import { bootstrapComponents } from '../bootstrap';
import { Class } from '../common';
import { ComponentDef } from '../component';
import { BootstrapContext, WesFeature } from '../feature';

export function testElement(componentType: Class): Class<any> {
  ComponentDef.define(componentType, { extend: { type: Object } });

  let result!: Class;

  const registry: CustomElementRegistry = {

    define(name: string, constructor: Class, options?: ElementDefinitionOptions): void {
      result = constructor;
    },

    get(name: string): any {
    },

    whenDefined(name: string): PromiseLike<void> {
      return Promise.resolve();
    }

  };

  @WesFeature({
    prebootstrap: { key: BootstrapContext.customElementsKey, value: registry },
    require: componentType,
  })
  class TestFeature {}

  bootstrapComponents(TestFeature);

  return result;
}
