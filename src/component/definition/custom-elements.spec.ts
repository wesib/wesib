import { ContextRegistry } from 'context-values';
import { NamespaceDef, newNamespaceAliaser } from 'namespace-aliaser';
import { BootstrapContext } from '../../boot';
import { BootstrapWindow, DefaultNamespaceAliaser } from '../../boot/globals';
import { ComponentRegistry } from '../../boot/impl';
import { ComponentFactory__symbol } from '../../boot/impl/component-factory.symbol.impl';
import { Class } from '../../common';
import { MethodSpy } from '../../spec/mocks';
import { ComponentClass } from './component-class';
import { ComponentFactory } from './component-factory';
import { CustomElements } from './custom-elements';

describe('component', () => {
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
      valueRegistry.provide({ a: DefaultNamespaceAliaser, by: newNamespaceAliaser });
    });

    beforeEach(() => {
      customElements = context.get(CustomElements);
    });

    beforeEach(() => {
      TestComponent = class {
        static [ComponentFactory__symbol]: Partial<ComponentFactory> = {
          elementDef: {
            name: 'test-component',
            extend: {
              get type() {
                return elementType;
              },
            }
          },
        };
      };

      elementType = HTMLElement;
    });

    describe('define', () => {
      it('defines custom element', () => {
        customElements.define(TestComponent, elementType);

        expect(registrySpy.define).toHaveBeenCalledWith('test-component', elementType);
      });
      it('defines custom element in namespace', () => {

        const ns = new NamespaceDef('test/url', 'test');
        class NsComponent {
          static [ComponentFactory__symbol]: Partial<ComponentFactory> = {
            elementDef: {
              name: ['other', ns],
              extend: {
                get type() {
                  return elementType;
                },
              },
            },
          };
        }

        customElements.define(NsComponent, elementType);

        expect(registrySpy.define).toHaveBeenCalledWith('test-other', elementType);
      });
      it('defines non-component custom element', () => {
        customElements.define('test-component', elementType);

        expect(registrySpy.define).toHaveBeenCalledWith('test-component', elementType);
      });
      it('does not define custom element for anonymous component', () => {

        class AnonymousComponent {
          static [ComponentFactory__symbol]: Partial<ComponentFactory> = {
            elementDef: {
              extend: {
                get type() {
                  return elementType;
                },
              },
            },
          };
        }

        customElements.define(AnonymousComponent, elementType);

        expect(registrySpy.define).not.toHaveBeenCalled();
      });
      it('defines custom element extending another one', () => {

        class BaseElement {
          static [ComponentFactory__symbol]: Partial<ComponentFactory> = {
            elementDef: {
              extend: {
                type: BaseElement,
              }
            },
          };
        }

        (TestComponent as any)[ComponentFactory__symbol] = {
          elementDef: {
            name: 'test-component',
            extend: {
              type: BaseElement,
            },
          },
        };

        customElements.define(TestComponent, elementType);

        expect(registrySpy.define).toHaveBeenCalledWith('test-component', elementType);
      });
      it('defines custom element extending standard one', () => {

        class BaseElement {
        }

        (TestComponent as any)[ComponentFactory__symbol] = {
          elementDef: {
            name: 'test-component',
            extend: {
              name: 'input',
              type: BaseElement,
            },
          },
        };

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
      it('waits for component definition in namespace', async () => {

        const ns = new NamespaceDef('test/url', 'test');
        class NsComponent {
          static [ComponentFactory__symbol]: Partial<ComponentFactory> = {
            elementDef: {
              name: ['other', ns],
              extend: {
                get type() {
                  return elementType;
                },
              },
            },
          };
        }

        class Element {
        }

        customElements.define(NsComponent, Element);

        await customElements.whenDefined(NsComponent);

        expect(registrySpy.whenDefined).toHaveBeenCalledWith('test-other');
      });
      it('awaits for non-component element definition', () => {

        const promise = Promise.resolve<any>('defined');

        registrySpy.whenDefined.mockReturnValue(promise);

        expect(customElements.whenDefined('test-component')).toBe(promise);
        expect(registrySpy.whenDefined).toHaveBeenCalledWith('test-component');
      });
      it('awaits for non-component element definition in namespace', () => {

        const ns = new NamespaceDef('test/url', 'test');
        const promise = Promise.resolve<any>('defined');

        registrySpy.whenDefined.mockReturnValue(promise);

        expect(customElements.whenDefined(['other', ns])).toBe(promise);
        expect(registrySpy.whenDefined).toHaveBeenCalledWith('test-other');
      });
      it('waits for anonymous component definition', async () => {

        class AnonymousComponent {
          static [ComponentFactory__symbol]: Partial<ComponentFactory> = {
            elementDef: {
              extend: {
                get type() {
                  return elementType;
                },
              },
            },
          };
        }

        class Element {
        }

        customElements.define(AnonymousComponent, Element);

        await customElements.whenDefined(AnonymousComponent);

        expect(registrySpy.whenDefined).not.toHaveBeenCalled();
      });
    });
  });
});
