import { Class } from '@proc7ts/primitives';
import { bootstrapComponents } from '../boot/bootstrap';
import { ComponentClass, CustomElements } from '../component/definition';
import { Feature } from '../feature';

/**
 * @category Testing
 * @experimental
 */
export async function testElement(componentType: ComponentClass): Promise<Class> {

  let result!: Class;

  const customElements: CustomElements = {

    define(_compType: ComponentClass, elementType: Class): void {
      result = elementType;
    },

    whenDefined(): Promise<void> {
      return Promise.resolve();
    },

  };

  @Feature({
    needs: componentType,
    setup(setup) {
      setup.provide({ a: CustomElements, is: customElements });
    },
  })
  class TestFeature {}

  await bootstrapComponents(TestFeature).whenDefined(componentType);

  return result;
}
