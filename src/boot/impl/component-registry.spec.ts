import { asis, noop } from 'call-thru';
import { Class, mergeFunctions } from '../../common';
import { ComponentDef, ComponentDef__symbol } from '../../component';
import { ComponentClass, CustomElements } from '../../component/definition';
import { BootstrapContext } from '../bootstrap-context';
import { BootstrapValueRegistry } from './bootstrap-value-registry.impl';
import { ComponentFactory__symbol } from './component-factory.symbol.impl';
import { ComponentRegistry } from './component-registry.impl';
import { ElementBuilder } from './element-builder.impl';
import Mocked = jest.Mocked;

describe('boot', () => {
  describe('ComponentRegistry', () => {

    let bootstrapRegistry: BootstrapValueRegistry;
    let mockBootstrapContext: Mocked<BootstrapContext>;
    let mockCustomElements: Mocked<CustomElements>;
    let ready: () => void;

    beforeEach(() => {
      ready = noop;
      bootstrapRegistry = BootstrapValueRegistry.create();
      mockBootstrapContext = {
        whenReady(callback: () => void) {
          ready = mergeFunctions(ready, callback);
        },
        get: bootstrapRegistry.values.get,
      } as any;
      bootstrapRegistry.provide({ a: BootstrapContext, is: mockBootstrapContext });

      mockCustomElements = {
        define: jest.fn(),
        whenDefined: jest.fn(),
      };
      bootstrapRegistry.provide({ a: CustomElements, is: mockCustomElements });
    });

    let mockBuilder: Mocked<ElementBuilder>;

    beforeEach(() => {
      mockBuilder = {
        buildElement: jest.fn(),
      } as any;
      bootstrapRegistry.provide({ a: ElementBuilder, is: mockBuilder });
    });

    let registry: ComponentRegistry;

    beforeEach(() => {
      registry = mockBootstrapContext.get(ComponentRegistry);
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
    describe('whenDefined', () => {
      it('awaits for component definition', async () => {

        class Element {}

        (TestComponent as any)[ComponentFactory__symbol] = { elementType: Element, componentType: TestComponent };

        mockCustomElements.whenDefined.mockReturnValue(Promise.resolve());

        await registry.whenDefined(TestComponent);

        expect(mockCustomElements.whenDefined).toHaveBeenCalledWith(TestComponent);
      });
      it('fails if component factory is absent', async () => {
        mockCustomElements.whenDefined.mockReturnValue(Promise.resolve());

        expect(await registry.whenDefined(TestComponent).catch(asis)).toBeInstanceOf(TypeError);
        expect(mockCustomElements.whenDefined).toHaveBeenCalledWith(TestComponent);
      });
      it('fails if component registry fails', async () => {

        const error = new Error();

        mockCustomElements.whenDefined.mockReturnValue(Promise.reject(error));

        expect(await registry.whenDefined(TestComponent).catch(asis)).toBe(error);
        expect(mockCustomElements.whenDefined).toHaveBeenCalledWith(TestComponent);
      });
    });
  });
});
