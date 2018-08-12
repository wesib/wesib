import {
  ComponentDesc,
  componentDesc,
  componentOf,
  ComponentType,
  describeComponent,
  descriptorOf, ElementRef,
} from '../component';
import { WebComponent } from '../decorators';
import { TestComponentRegistry } from '../spec/test-component-registry';
import { ComponentRegistry } from './component-registry';
import { ElementBuilder } from './element-builder';
import SpyObj = jasmine.SpyObj;
import Spy = jasmine.Spy;

describe('element/component-registry', () => {
  describe('ComponentRegistry', () => {

    it('uses current window by default', () => {

      const registry = new ComponentRegistry();

      expect(registry.window).toBe(window);
    });
    it('constructs element builder by default', () => {

      const registry = new ComponentRegistry();

      expect(registry.builder).toEqual(jasmine.any(ElementBuilder));
      expect(registry.builder.window).toBe(registry.window);
    });
    it('constructed element builder uses the same window instance', () => {

      const window: Window = { name: 'window' } as any;
      const registry = new ComponentRegistry({ window });

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
        registry = new ComponentRegistry({ window: windowSpy, builder: builderSpy });
      });
      beforeEach(() => {
        TestComponent = class {
          static [componentDesc]: ComponentDesc = {
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
          describeComponent(TestComponent, {
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

    describe('component instantiation', () => {

      let registry: TestComponentRegistry;
      let TestComponent: ComponentType;
      let constructorSpy: Spy;
      let element: HTMLElement;

      beforeEach(async () => {
        registry = await new TestComponentRegistry().create();
      });
      afterEach(() => registry.dispose());

      beforeEach(() => {
        constructorSpy = jasmine.createSpy('constructor');

        TestComponent = class {

          static [componentDesc]: ComponentDesc = {
            name: 'custom-component',
          };

          constructor(...args: any[]) {
            constructorSpy(...args);
          }
        };
      });
      beforeEach(async () => {
        element = await registry.addElement(TestComponent);
      });

      it('instantiates custom element', async () => {
        expect(element).toBeDefined();
      });
      it('custom element has component reference', () => {
        expect(componentOf(element)).toEqual(jasmine.any(TestComponent));
      });
      it('passes element reference to component', () => {

        const expectedRef: ElementRef = {
          element,
        };

        expect(constructorSpy).toHaveBeenCalledWith(expectedRef);
      });
    });
  });
});
