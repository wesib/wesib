import SpyObj = jasmine.SpyObj;
import { Class } from '../../common';
import { ContextValueRegistry } from '../../common/context';
import { BootstrapContext } from '../../feature';
import { ComponentClass } from '../component';
import { ComponentDef } from '../component-def';
import { CustomElements } from './custom-elements';

describe('component/definition/custom-elements', () => {
  describe('CustomElements', () => {

    let context: BootstrapContext;
    let registrySpy: SpyObj<CustomElementRegistry>;
    let customElements: CustomElements;
    let TestComponent: ComponentClass;
    let elementType: Class;

    beforeEach(() => {

      const valueRegistry = new ContextValueRegistry<BootstrapContext>();

      registrySpy = jasmine.createSpyObj('customElements', ['define', 'whenDefined']);
      const windowSpy: Window = {
        customElements: registrySpy,
      } as any;

      context = {
        get: valueRegistry.newValues().get,
      } as any;

      valueRegistry.provide(BootstrapContext.windowKey, () => windowSpy);
    });

    beforeEach(() => {
      customElements = context.get(CustomElements.key);
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

        customElements.define(TestComponent, elementType);

        expect(registrySpy.define).toHaveBeenCalledWith('test-component', elementType);
      });
      it('defines custom element extending standard one', () => {
        ComponentDef.define(TestComponent, {
          extend: {
            name: 'input',
            type: HTMLInputElement,
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

        registrySpy.whenDefined.and.returnValue(promise);

        expect(customElements.whenDefined(TestComponent)).toBe(promise);
        expect(registrySpy.whenDefined).toHaveBeenCalledWith('test-component');
      });
    });
  });
});
