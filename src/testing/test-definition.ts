import { OnEvent } from '@proc7ts/fun-events';
import { Class } from '@proc7ts/primitives';
import { bootstrapComponents } from '../bootstrap-components';
import { CustomElements, DefinitionContext } from '../component/definition';
import { FeatureDef, FeatureDef__symbol } from '../feature';

/**
 * @category Testing
 * @experimental
 */
export function testDefinition<T extends object>(componentType: Class<T>): OnEvent<[DefinitionContext<T>]> {

  const customElements: CustomElements = {

    define(): void {/* do not register element */},

    whenDefined(): Promise<void> {
      return Promise.resolve();
    },

  };

  const featureDef: FeatureDef = {
    needs: componentType,
    setup(setup) {
      setup.provide({ a: CustomElements, is: customElements });
    },
  };

  class TestFeature {

    static get [FeatureDef__symbol](): FeatureDef {
      return featureDef;
    }

  }

  return bootstrapComponents(TestFeature).whenDefined(componentType);
}
