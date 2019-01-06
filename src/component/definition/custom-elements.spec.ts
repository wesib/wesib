import { ContextRegistry } from 'context-values';
import { Class } from '../../common';
import { BootstrapContext, BootstrapWindow } from '../../kit';
import { ComponentClass } from '../component-class';
import { ComponentDef } from '../component-def';
import { CustomElements } from './custom-elements';
import Mocked = jest.Mocked;

describe('kit/custom-elements', () => {
  describe('CustomElements', () => {

    let context: BootstrapContext;
    let registrySpy: Mocked<CustomElementRegistry>;
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
    });
  });
});
