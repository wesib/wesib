import { ContextRequest } from '../../common';
import { BootstrapContext } from '../../feature';
import { ComponentClass } from '../component-class';
import { ComponentDef } from '../component-def';
import { ComponentRegistry } from './component-registry';
import { CustomElements } from './custom-elements';
import { ElementBuilder } from './element-builder';
import SpyObj = jasmine.SpyObj;

describe('component/definition/component-registry', () => {
  describe('ComponentRegistry', () => {

    let customElementsSpy: SpyObj<CustomElements>;
    let bootstrapContextSpy: SpyObj<BootstrapContext>;
    let builderSpy: SpyObj<ElementBuilder>;
    let registry: ComponentRegistry;
    let TestComponent: ComponentClass;
    let ElementSpy: SpyObj<HTMLElement>;

    beforeEach(() => {
      bootstrapContextSpy = jasmine.createSpyObj('bootstrapContext', ['get']);
      bootstrapContextSpy.get.and.callFake((request: ContextRequest<any>) => {
        if (request.key === CustomElements.key) {
          return customElementsSpy;
        }
        return;
      });
      customElementsSpy = jasmine.createSpyObj('customElements', ['define', 'whenDefined']);
    });
    beforeEach(() => {
      builderSpy = jasmine.createSpyObj('builder', ['buildElement']);
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

      ElementSpy = jasmine.createSpyObj('Element', ['addEventListener']);
      builderSpy.buildElement.and.returnValue(ElementSpy);
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

        customElementsSpy.whenDefined.and.returnValue(promise);

        expect(registry.whenDefined(TestComponent)).toBe(promise);
        expect(customElementsSpy.whenDefined).toHaveBeenCalledWith(TestComponent);
      });
    });
  });
});
