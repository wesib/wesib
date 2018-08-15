import { ComponentDef, componentDef, ComponentType, defineComponent } from '../component';
import { ComponentRegistry } from './component-registry';
import { ElementBuilder } from './element-builder';
import SpyObj = jasmine.SpyObj;

describe('element/component-registry', () => {
  describe('ComponentRegistry', () => {

    it('uses current window by default', () => {

      const registry = ComponentRegistry.create();

      expect(registry.window).toBe(window);
    });
    it('constructs element builder by default', () => {

      const registry = ComponentRegistry.create();

      expect(registry.builder).toEqual(jasmine.any(ElementBuilder));
      expect(registry.builder.window).toBe(registry.window);
    });
    it('constructed element builder uses the same window instance', () => {

      const window: Window = { name: 'window' } as any;
      const registry = ComponentRegistry.create({ window });

      expect(registry.window).toBe(registry.builder.window);
    });

    describe('methods', () => {

      let windowSpy: SpyObj<Window>;
      let customElementsSpy: SpyObj<CustomElementRegistry>;
      let builderSpy: SpyObj<ElementBuilder>;
      let registry: ComponentRegistry;
      let TestComponent: ComponentType;
      let ElementSpy: SpyObj<HTMLElement>;

      beforeEach(() => {
        windowSpy = jasmine.createSpyObj('window', ['addEventListener']);
        customElementsSpy = jasmine.createSpyObj('customElements', ['define', 'whenDefined']);
        (windowSpy as any).customElements = customElementsSpy;
      });
      beforeEach(() => {
        builderSpy = jasmine.createSpyObj('builder', ['buildElement']);
      });
      beforeEach(() => {
        registry = ComponentRegistry.create({ window: windowSpy, builder: builderSpy });
      });
      beforeEach(() => {
        TestComponent = class {
          static [componentDef]: ComponentDef = {
            name: 'test-component',
          };
        };

        ElementSpy = jasmine.createSpyObj('Element', ['addEventListener']);
        builderSpy.buildElement.and.returnValue(ElementSpy);
      });

      describe('define', () => {
        it('builds custom element', () => {
          registry.define(TestComponent);

          expect(builderSpy.buildElement).toHaveBeenCalledWith(TestComponent);
        });
        it('defines custom element', () => {
          registry.define(TestComponent);

          expect(customElementsSpy.define).toHaveBeenCalledWith('test-component', ElementSpy);
        });
        it('defines custom element extending the given one', () => {
          defineComponent(TestComponent, {
            extend: {
              name: 'input',
              type: HTMLInputElement,
            }
          });

          registry.define(TestComponent);

          expect(customElementsSpy.define).toHaveBeenCalledWith('test-component', ElementSpy, {
            extends: 'input',
          });
        });
      });
    });
  });
});
