import { ContextKey__symbol, ContextRequest } from 'context-values';
import { Class } from '../../common';
import { ComponentDef, ComponentDef__symbol } from '../../component';
import { ComponentClass, CustomElements } from '../../component/definition';
import { ObjectMock } from '../../spec/mocks';
import { BootstrapContext } from '../bootstrap-context';
import { ComponentFactory__symbol } from './component-factory.symbol.impl';
import { ComponentRegistry } from './component-registry.impl';
import { ElementBuilder } from './element-builder.impl';

describe('boot', () => {
  describe('ComponentRegistry', () => {

    let customElementsSpy: ObjectMock<CustomElements, 'define' | 'whenDefined'>;
    let bootstrapContextSpy: ObjectMock<BootstrapContext>;
    let builderSpy: ObjectMock<ElementBuilder> & ElementBuilder;
    let registry: ComponentRegistry;
    let TestComponent: ComponentClass;
    let ElementSpy: Class;

    beforeEach(() => {
      bootstrapContextSpy = {
        get: jest.fn((request: ContextRequest<any>) => {
          if (request[ContextKey__symbol] === CustomElements[ContextKey__symbol]) {
            return customElementsSpy;
          }
          return;
        })
      } as any;
      customElementsSpy = {
        define: jest.fn(),
        whenDefined: jest.fn(),
      };
    });
    beforeEach(() => {
      builderSpy = {
        buildElement: jest.fn(),
      } as any;
    });
    beforeEach(() => {
      registry = ComponentRegistry.create({
        bootstrapContext: bootstrapContextSpy,
        elementBuilder: builderSpy,
      });
    });
    beforeEach(() => {
      TestComponent = class {
        static [ComponentDef__symbol]: ComponentDef = {
          name: 'test-component',
        };
      };

      ElementSpy = { name: 'Element' } as any;
      builderSpy.buildElement.mockReturnValue({ elementType: ElementSpy } as any);
    });

    describe('define', () => {
      it('builds custom element', () => {
        registry.define(TestComponent);
        registry.complete();

        expect(builderSpy.buildElement).toHaveBeenCalledWith(TestComponent);
      });
      it('defines custom element', () => {
        registry.define(TestComponent);
        registry.complete();

        expect(customElementsSpy.define).toHaveBeenCalledWith(TestComponent, ElementSpy);
      });
    });
    describe('whenDefined', () => {
      it('awaits for component definition', async () => {

        class Element {}

        (TestComponent as any)[ComponentFactory__symbol] = { elementType: Element, componentType: TestComponent };

        customElementsSpy.whenDefined.mockReturnValue(Promise.resolve());

        await registry.whenDefined(TestComponent);

        expect(customElementsSpy.whenDefined).toHaveBeenCalledWith(TestComponent);
      });
      it('fails if component factory is absent', async () => {
        customElementsSpy.whenDefined.mockReturnValue(Promise.resolve());

        expect(registry.whenDefined(TestComponent)).rejects.toThrow(TypeError);
        expect(customElementsSpy.whenDefined).toHaveBeenCalledWith(TestComponent);
      });
      it('fails if component registry fails', async () => {

        const error = new Error();

        customElementsSpy.whenDefined.mockReturnValue(Promise.reject(error));

        expect(registry.whenDefined(TestComponent)).rejects.toBe(error);
        expect(customElementsSpy.whenDefined).toHaveBeenCalledWith(TestComponent);
      });
    });
  });
});
