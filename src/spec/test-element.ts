import { bootstrapComponents } from '../bootstrap';
import { Class } from '../common';
import { ComponentClass, ComponentDef, CustomElements } from '../component';
import { Feature } from '../feature';

export function testElement(componentType: Class): Class<any> {
  ComponentDef.define(componentType);

  let result!: Class;

  const customElements: CustomElements = {

    define(compType: ComponentClass<any>, elementType: Class<any>): void {
      result = elementType;
    },

    whenDefined(): Promise<void> {
      return Promise.resolve();
    }

  };

  @Feature({
    set: { a: CustomElements, is: customElements },
    need: componentType,
  })
  class TestFeature {}

  bootstrapComponents(TestFeature);

  return result;
}
