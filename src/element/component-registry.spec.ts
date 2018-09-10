import { ContextValueKey, EventInterest } from '../common';
import { ComponentDef, ComponentType } from '../component';
import { BootstrapContext } from '../feature';
import { ComponentRegistry } from './component-registry';
import { ElementBuilder } from './element-builder';
import Spy = jasmine.Spy;
import SpyObj = jasmine.SpyObj;

describe('element/component-registry', () => {
  describe('ComponentRegistry', () => {

    let windowSpy: SpyObj<Window>;
    let customElementsSpy: SpyObj<CustomElementRegistry>;
    let bootstrapContextSpy: SpyObj<BootstrapContext>;
    let builderSpy: SpyObj<ElementBuilder>;
    let registry: ComponentRegistry;
    let TestComponent: ComponentType;
    let ElementSpy: SpyObj<HTMLElement>;

    beforeEach(() => {
      windowSpy = jasmine.createSpyObj('window', ['addEventListener']);
      customElementsSpy = jasmine.createSpyObj('customElements', ['define', 'whenDefined']);
      bootstrapContextSpy = jasmine.createSpyObj('bootstrapContext', ['get']);
      bootstrapContextSpy.get.and.callFake((key: ContextValueKey<any>) => {
        if (key === BootstrapContext.customElementsKey) {
          return customElementsSpy;
        }
        return;
      });
    });
    beforeEach(() => {
      builderSpy = jasmine.createSpyObj('builder', ['buildElement']);
      (builderSpy as any).window = windowSpy;
      (builderSpy as any).bootstrapContext = bootstrapContextSpy;
    });
    beforeEach(() => {
      registry = ComponentRegistry.create({ builder: builderSpy });
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

        expect(customElementsSpy.define).toHaveBeenCalledWith('test-component', ElementSpy);
      });
      it('defines custom element extending another one', () => {

        class BaseElement extends HTMLElement {
          constructor() {
            super();
          }
        }

        ComponentDef.define(TestComponent, {
          extend: {
            type: BaseElement,
          }
        });

        registry.define(TestComponent);
        registry.complete();

        expect(customElementsSpy.define).toHaveBeenCalledWith('test-component', ElementSpy);
      });
      it('defines custom element extending standard one', () => {
        ComponentDef.define(TestComponent, {
          extend: {
            name: 'input',
            type: HTMLInputElement,
          }
        });

        registry.define(TestComponent);
        registry.complete();

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
    describe('component definition listener', () => {

      let listenerSpy: Spy;
      let interest: EventInterest;

      beforeEach(() => {
        listenerSpy = jasmine.createSpy('listener');
        interest = registry.componentDefinitions.on(listenerSpy);
      });

      it('is notified on component definition', () => {
        registry.define(TestComponent);
        registry.complete();

        expect(listenerSpy).toHaveBeenCalledWith(TestComponent);
        expect(builderSpy.buildElement).toHaveBeenCalledWith(TestComponent);
      });
      it('replaces component with another one', () => {

        class ReplacementComponent {
          static [ComponentDef.symbol]: ComponentDef = {
            name: 'replacement-component',
          };
        }

        listenerSpy.and.returnValue(ReplacementComponent);

        registry.define(TestComponent);
        registry.complete();

        expect(listenerSpy).toHaveBeenCalledWith(TestComponent);
        expect(builderSpy.buildElement).toHaveBeenCalledWith(ReplacementComponent);
        expect(builderSpy.buildElement).not.toHaveBeenCalledWith(TestComponent);
      });
    });
    describe('element definition listener', () => {

      let listenerSpy: Spy;
      let interest: EventInterest;

      beforeEach(() => {
        listenerSpy = jasmine.createSpy('listener');
        interest = registry.elementDefinitions.on(listenerSpy);
      });

      it('is notified on element definition', () => {
        registry.define(TestComponent);
        registry.complete();

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
        registry.complete();

        expect(listenerSpy).toHaveBeenCalledWith(ElementSpy, TestComponent);
        expect(customElementsSpy.define).toHaveBeenCalledWith('test-component', ReplacementElement);
        expect(customElementsSpy.define).not.toHaveBeenCalledWith('test-component', ElementSpy);
      });
    });
  });
});
