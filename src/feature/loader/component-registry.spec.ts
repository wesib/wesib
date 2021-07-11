import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { cxConstAsset } from '@proc7ts/context-builder';
import { Class } from '@proc7ts/primitives';
import { BootstrapContext } from '../../boot';
import { bootstrapComponents } from '../../bootstrap-components';
import { ComponentDef, ComponentDef__symbol } from '../../component';
import { ComponentClass, CustomElements } from '../../component/definition';
import { ElementBuilder } from '../../impl';
import { MockObject } from '../../spec';
import { Feature } from '../feature.amendment';

describe('feature load', () => {
  describe('ComponentRegistry', () => {

    let TestComponent: ComponentClass;
    let ElementSpy: Class;
    let mockBuilder: MockObject<ElementBuilder>;

    beforeEach(() => {
      mockBuilder = {
        buildElement: jest.fn(),
      } as any;

      TestComponent = class {

        static [ComponentDef__symbol]: ComponentDef = {
          name: 'test-component',
        };

      };

      ElementSpy = { name: 'Element' } as any;
      mockBuilder.buildElement.mockReturnValue({ elementType: ElementSpy } as any);
    });

    let bsContext: BootstrapContext;
    let mockCustomElements: MockObject<CustomElements>;

    beforeEach(async () => {
      mockCustomElements = {
        define: jest.fn(),
        whenDefined: jest.fn(),
      };

      @Feature({
        setup(setup) {
          setup.provide(cxConstAsset(CustomElements, mockCustomElements));
          setup.provide(cxConstAsset(ElementBuilder, mockBuilder));
        },
      })
      class TestFeature {
      }

      bsContext = await bootstrapComponents(TestFeature).whenReady;
    });

    describe('define', () => {
      it('builds custom element', async () => {
        await defineComponent();

        expect(mockBuilder.buildElement).toHaveBeenCalledWith(TestComponent);
      });
      it('defines custom element', async () => {
        await defineComponent();

        expect(mockCustomElements.define).toHaveBeenCalledWith(TestComponent, ElementSpy);
      });
    });

    async function defineComponent(): Promise<void> {
      @Feature({
        init(context) {
          context.define(TestComponent);
        },
      })
      class ComponentFeature {
      }

      await bsContext.load(ComponentFeature).whenReady;
    }
  });
});
