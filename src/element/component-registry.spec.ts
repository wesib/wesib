import { ComponentDef, componentDef, ComponentType, defineComponent } from '../component';
import { Disposable } from '../types';
import { ComponentRegistry } from './component-registry';
import { ElementBuilder } from './element-builder';
import SpyObj = jasmine.SpyObj;
import Spy = jasmine.Spy;

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
      describe('whenDefined', () => {
        it('awaits for component definition', () => {

          const promise = Promise.resolve<any>('defined');

          customElementsSpy.whenDefined.and.returnValue(promise);

          expect(registry.whenDefined(TestComponent)).toBe(promise);
          expect(customElementsSpy.whenDefined).toHaveBeenCalledWith('test-component');
        });
      });
      describe('onComponentDefinition listener', () => {

        let listenerSpy: Spy;
        let handle: Disposable;

        beforeEach(() => {
          listenerSpy = jasmine.createSpy('listener');
          handle = registry.onComponentDefinition(listenerSpy);
        });

        it('is notified on component definition', () => {
          registry.define(TestComponent);

          expect(listenerSpy).toHaveBeenCalledWith(TestComponent);
          expect(builderSpy.buildElement).toHaveBeenCalledWith(TestComponent);
        });
        it('replaces component with another one', () => {

          class ReplacementComponent {
            static [componentDef]: ComponentDef = {
              name: 'replacement-component',
            };
          }

          listenerSpy.and.returnValue(ReplacementComponent);

          registry.define(TestComponent);

          expect(listenerSpy).toHaveBeenCalledWith(TestComponent);
          expect(builderSpy.buildElement).toHaveBeenCalledWith(ReplacementComponent);
          expect(builderSpy.buildElement).not.toHaveBeenCalledWith(TestComponent);
        });
        it('is removed on handle disposal', () => {
          handle.dispose();
          handle.dispose();

          registry.define(TestComponent);

          expect(listenerSpy).not.toHaveBeenCalled();
        });
      });
      describe('onElementDefinition listener', () => {

        let listenerSpy: Spy;
        let handle: Disposable;

        beforeEach(() => {
          listenerSpy = jasmine.createSpy('listener');
          handle = registry.onElementDefinition(listenerSpy);
        });

        it('is notified on element definition', () => {
          registry.define(TestComponent);

          expect(listenerSpy).toHaveBeenCalledWith(ElementSpy, TestComponent);
          expect(customElementsSpy.define).toHaveBeenCalledWith('test-component', ElementSpy);
        });
        it('replaces element with another one', () => {

          class ReplacementElement extends HTMLElement {
            constructor() {
              super();
            }
          }

          listenerSpy.and.returnValue(ReplacementElement);

          registry.define(TestComponent);

          expect(listenerSpy).toHaveBeenCalledWith(ElementSpy, TestComponent);
          expect(customElementsSpy.define).toHaveBeenCalledWith('test-component', ReplacementElement);
          expect(customElementsSpy.define).not.toHaveBeenCalledWith('test-component', ElementSpy);
        });
        it('is removed on handle disposal', () => {
          handle.dispose();
          handle.dispose();

          registry.define(TestComponent);

          expect(listenerSpy).not.toHaveBeenCalled();
        });
      });
    });
  });
});
