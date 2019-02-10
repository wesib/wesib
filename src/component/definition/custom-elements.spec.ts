import { ContextRegistry } from 'context-values';
import { Class } from '../../common';
import { BootstrapContext, BootstrapWindow } from '../../kit';
import { ComponentRegistry } from '../../kit/definition/component-registry';
import { MethodSpy } from '../../spec/mocks';
import { ComponentClass } from '../component-class';
import { ComponentDef } from '../component-def';
import { CustomElements } from './custom-elements';

describe('kit/custom-elements', () => {
  describe('CustomElements', () => {

    let context: BootstrapContext;
    let registrySpy: {
      define: MethodSpy<ComponentRegistry, 'define'>;
      whenDefined: MethodSpy<ComponentRegistry, 'whenDefined'>;
    };
    let customElements: CustomElements;
    let TestComponent: ComponentClass;
    let elementType: Class;

    beforeEach(() => {

      const valueRegistry = new ContextRegistry<BootstrapContext>();

      registrySpy = {
        define: jest.fn(),
        whenDefined: jest.fn(),
      } as any;
      const windowSpy: Window = {
        customElements: registrySpy,
      } as any;

      context = {
        get: valueRegistry.newValues().get,
      } as any;

      valueRegistry.provide({ a: BootstrapWindow, is: windowSpy });
    });

    beforeEach(() => {
      customElements = context.get(CustomElements);
    });

    beforeEach(() => {
      TestComponent = class {
        static [ComponentDef.symbol]: ComponentDef = {
          name: 'test-component',
        };
      };

      elementType = HTMLElement;
    });

    describe('define', () => {
      it('defines custom element', () => {
        customElements.define(TestComponent, elementType);

        expect(registrySpy.define).toHaveBeenCalledWith('test-component', elementType);
      });
      it('defines non-component custom element', () => {
        customElements.define('test-component', elementType);

        expect(registrySpy.define).toHaveBeenCalledWith('test-component', elementType);
      });
      it('does not define custom element for anonymous component', () => {

        class AnonymousComponent {
        }

        ComponentDef.define(AnonymousComponent);

        customElements.define(AnonymousComponent, elementType);

        expect(registrySpy.define).not.toHaveBeenCalled();
      });
      it('defines custom element extending another one', () => {

        class BaseElement {
        }

        ComponentDef.define(TestComponent, {
          extend: {
            type: BaseElement,
          }
        });

        customElements.define(TestComponent, elementType);

        expect(registrySpy.define).toHaveBeenCalledWith('test-component', elementType);
      });
      it('defines custom element extending standard one', () => {

        class BaseElement {
        }

        ComponentDef.define(TestComponent, {
          extend: {
            name: 'input',
            type: BaseElement,
          }
        });

        customElements.define(TestComponent, elementType);

        expect(registrySpy.define).toHaveBeenCalledWith('test-component', elementType, {
          extends: 'input',
        });
      });
    });

    describe('whenDefined', () => {
      it('awaits for component definition', () => {

        const promise = Promise.resolve<any>('defined');

        registrySpy.whenDefined.mockReturnValue(promise);

        expect(customElements.whenDefined(TestComponent)).toBe(promise);
        expect(registrySpy.whenDefined).toHaveBeenCalledWith('test-component');
      });
      it('awaits for non-component element definition', () => {

        const promise = Promise.resolve<any>('defined');

        registrySpy.whenDefined.mockReturnValue(promise);

        expect(customElements.whenDefined('test-component')).toBe(promise);
        expect(registrySpy.whenDefined).toHaveBeenCalledWith('test-component');
      });
      it('waits for anonymous component definition', async () => {

        class AnonymousComponent {
        }
        ComponentDef.define(AnonymousComponent);

        class Element {
        }

        customElements.define(AnonymousComponent, Element);

        await customElements.whenDefined(AnonymousComponent);

        expect(registrySpy.whenDefined).not.toHaveBeenCalled();
      });
    });
  });
});
