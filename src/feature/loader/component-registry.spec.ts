import { noop } from 'call-thru';
import { BootstrapContext } from '../../boot';
import { BootstrapContextRegistry, ElementBuilder } from '../../boot/impl';
import { Class, mergeFunctions } from '../../common';
import { ComponentDef, ComponentDef__symbol } from '../../component';
import { ComponentClass, CustomElements } from '../../component/definition';
import { FeatureContext } from '../feature-context';
import { ComponentRegistry } from './component-registry.impl';
import Mocked = jest.Mocked;

describe('feature load', () => {
  describe('ComponentRegistry', () => {

    let featureRegistry: BootstrapContextRegistry;
    let mockFeatureContext: Mocked<FeatureContext>;
    let mockCustomElements: Mocked<CustomElements>;
    let ready: () => void;

    beforeEach(() => {
      ready = noop;
      featureRegistry = BootstrapContextRegistry.create();
      mockFeatureContext = {
        whenReady(callback: () => void) {
          ready = mergeFunctions(ready, callback);
        },
        get: featureRegistry.values.get,
      } as any;
      featureRegistry.provide({ a: BootstrapContext, is: mockFeatureContext });

      mockCustomElements = {
        define: jest.fn(),
        whenDefined: jest.fn(),
      };
      featureRegistry.provide({ a: CustomElements, is: mockCustomElements });
    });

    let mockBuilder: Mocked<ElementBuilder>;

    beforeEach(() => {
      mockBuilder = {
        buildElement: jest.fn(),
      } as any;
      featureRegistry.provide({ a: ElementBuilder, is: mockBuilder });
    });

    let registry: ComponentRegistry;

    beforeEach(() => {
      registry = new ComponentRegistry(mockFeatureContext);
    });

    let TestComponent: ComponentClass;
    let ElementSpy: Class;

    beforeEach(() => {
      TestComponent = class {
        static [ComponentDef__symbol]: ComponentDef = {
          name: 'test-component',
        };
      };

      ElementSpy = { name: 'Element' } as any;
      mockBuilder.buildElement.mockReturnValue({ elementType: ElementSpy } as any);
    });

    describe('define', () => {
      it('builds custom element', () => {
        registry.define(TestComponent);
        ready();

        expect(mockBuilder.buildElement).toHaveBeenCalledWith(TestComponent);
      });
      it('defines custom element', () => {
        registry.define(TestComponent);
        ready();

        expect(mockCustomElements.define).toHaveBeenCalledWith(TestComponent, ElementSpy);
      });
    });
  });
});
