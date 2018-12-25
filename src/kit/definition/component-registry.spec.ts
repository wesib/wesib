import { ContextRequest } from 'context-values';
import { ComponentClass, ComponentDef } from '../../component';
import { CustomElements } from '../../component/definition';
import { BootstrapContext } from '../bootstrap-context';
import { COMPONENT_FACTORY, ComponentRegistry } from './component-registry';
import { ElementBuilder } from './element-builder';
import Mocked = jest.Mocked;

describe('kit/definition/component-registry', () => {
  describe('ComponentRegistry', () => {

    let customElementsSpy: Mocked<Pick<CustomElements, 'define' | 'whenDefined'>>;
    let bootstrapContextSpy: Mocked<BootstrapContext>;
    let builderSpy: Mocked<ElementBuilder>;
    let registry: ComponentRegistry;
    let TestComponent: ComponentClass;
    let ElementSpy: Mocked<HTMLElement>;

    beforeEach(() => {
      bootstrapContextSpy = {
        get: jest.fn((request: ContextRequest<any>) => {
          if (request.key === CustomElements.key) {
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
        static [ComponentDef.symbol]: ComponentDef = {
          name: 'test-component',
        };
      };

      ElementSpy = {
        addEventListener: jest.fn(),
      } as any;
      builderSpy.buildElement.mockReturnValue({ elementType: ElementSpy });
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

        (TestComponent as any)[COMPONENT_FACTORY] = { elementType: Element, componentType: TestComponent };

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
