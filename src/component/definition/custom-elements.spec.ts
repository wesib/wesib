import { ContextRegistry } from '@proc7ts/context-values';
import { NamespaceDef, newNamespaceAliaser } from '@proc7ts/namespace-aliaser';
import { BootstrapContext } from '../../boot';
import { BootstrapWindow, DefaultNamespaceAliaser } from '../../boot/globals';
import { ComponentFactory__symbol } from '../../boot/impl/component-factory.symbol.impl';
import { Class } from '../../common';
import { ComponentClass } from './component-class';
import { ComponentFactory } from './component-factory';
import { CustomElements } from './custom-elements';
import Mocked = jest.Mocked;

describe('component', () => {
  describe('CustomElements', () => {

    let context: BootstrapContext;
    let mockCustomElements: Mocked<CustomElements>;
    let customElements: CustomElements;
    let TestComponent: ComponentClass;
    let elementType: Class;

    beforeEach(() => {

      const registry = new ContextRegistry<BootstrapContext>();

      mockCustomElements = {
        define: jest.fn(),
        whenDefined: jest.fn(),
      };
      const mockWindow: Mocked<BootstrapWindow> = {
        customElements: mockCustomElements,
      } as any;

      context = {
        get: registry.newValues().get,
      } as any;

      registry.provide({ a: BootstrapWindow, is: mockWindow });
      registry.provide({ a: DefaultNamespaceAliaser, by: newNamespaceAliaser });
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
            },
          },
        };

      };

      elementType = HTMLElement;
    });

    describe('define', () => {
      it('defines custom element', () => {
        customElements.define(TestComponent, elementType);

        expect(mockCustomElements.define).toHaveBeenCalledWith('test-component', elementType);
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

        expect(mockCustomElements.define).toHaveBeenCalledWith('test-other', elementType);
      });
      it('defines non-component custom element', () => {
        customElements.define('test-component', elementType);

        expect(mockCustomElements.define).toHaveBeenCalledWith('test-component', elementType);
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

        expect(mockCustomElements.define).not.toHaveBeenCalled();
      });
      it('defines custom element extending another one', () => {

        class BaseElement {

          static [ComponentFactory__symbol]: Partial<ComponentFactory> = {
            elementDef: {
              extend: {
                type: BaseElement,
              },
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

        expect(mockCustomElements.define).toHaveBeenCalledWith('test-component', elementType);
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

        expect(mockCustomElements.define).toHaveBeenCalledWith('test-component', elementType, {
          extends: 'input',
        });
      });
    });

    describe('whenDefined', () => {
      it('awaits for component definition', () => {

        const promise = Promise.resolve<any>('defined');

        mockCustomElements.whenDefined.mockReturnValue(promise);

        expect(customElements.whenDefined(TestComponent)).toBe(promise);
        expect(mockCustomElements.whenDefined).toHaveBeenCalledWith('test-component');
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

        expect(mockCustomElements.whenDefined).toHaveBeenCalledWith('test-other');
      });
      it('awaits for non-component element definition', () => {

        const promise = Promise.resolve<any>('defined');

        mockCustomElements.whenDefined.mockReturnValue(promise);

        expect(customElements.whenDefined('test-component')).toBe(promise);
        expect(mockCustomElements.whenDefined).toHaveBeenCalledWith('test-component');
      });
      it('awaits for non-component element definition in namespace', () => {

        const ns = new NamespaceDef('test/url', 'test');
        const promise = Promise.resolve<any>('defined');

        mockCustomElements.whenDefined.mockReturnValue(promise);

        expect(customElements.whenDefined(['other', ns])).toBe(promise);
        expect(mockCustomElements.whenDefined).toHaveBeenCalledWith('test-other');
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

        expect(mockCustomElements.whenDefined).not.toHaveBeenCalled();
      });
    });
  });
});
