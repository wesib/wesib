import { ContextRequest } from 'context-values';
import { BootstrapContext } from '..';
import { ComponentClass, ComponentDef } from '../../component';
import { CustomElements } from '../../component/definition';
import { ComponentRegistry } from './component-registry';
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
      builderSpy.buildElement.mockReturnValue(ElementSpy);
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
      it('awaits for component definition', () => {

        const promise = Promise.resolve<any>('defined');

        customElementsSpy.whenDefined.mockReturnValue(promise);

        expect(registry.whenDefined(TestComponent)).toBe(promise);
        expect(customElementsSpy.whenDefined).toHaveBeenCalledWith(TestComponent);
      });
    });
  });
});
