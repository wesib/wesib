import { NamespaceDef } from '@frontmeans/namespace-aliaser';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { cxConstAsset } from '@proc7ts/context-builder';
import { Class } from '@proc7ts/primitives';
import { BootstrapContext } from '../../boot';
import { BootstrapWindow } from '../../globals';
import { BootstrapContextBuilder } from '../../impl';
import { DefinitionContext__symbol } from '../../impl/definition-context.symbol';
import { MockObject } from '../../spec';
import { ComponentClass } from './component-class';
import { CustomElements } from './custom-elements';
import { DefinitionContext } from './definition-context';

describe('component', () => {
  describe('CustomElements', () => {

    let context: BootstrapContext;
    let mockCustomElements: MockObject<CustomElements>;
    let customElements: CustomElements;
    let TestComponent: ComponentClass;
    let elementType: Class;

    beforeEach(() => {

      const bsBuilder = new BootstrapContextBuilder(get => ({ get }) as BootstrapContext);

      context = bsBuilder.context;
      mockCustomElements = {
        define: jest.fn(),
        whenDefined: jest.fn(),
      };

      const mockWindow: MockObject<BootstrapWindow> = {
        customElements: mockCustomElements,
      } as any;

      bsBuilder.provide(cxConstAsset(BootstrapWindow, mockWindow));
    });

    beforeEach(() => {
      customElements = context.get(CustomElements);
    });

    beforeEach(() => {
      TestComponent = class {

        static [DefinitionContext__symbol]: Partial<DefinitionContext> = {
          elementDef: {
            name: 'test-component',
            tagName: 'test-component',
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

    describe('toString', () => {
      it('provides string representation', () => {
        expect(String(CustomElements)).toBe('[CustomElements]');
      });
    });

    describe('define', () => {
      it('defines custom element', () => {
        customElements.define(TestComponent, elementType);

        expect(mockCustomElements.define).toHaveBeenCalledWith('test-component', elementType);
      });
      it('defines custom element in namespace', () => {

        const ns = new NamespaceDef('test/url', 'test');

        class NsComponent {

          static [DefinitionContext__symbol]: Partial<DefinitionContext> = {
            elementDef: {
              name: ['other', ns],
              tagName: 'test-other',
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

          static [DefinitionContext__symbol]: Partial<DefinitionContext> = {
            elementDef: {
              name: undefined,
              tagName: undefined,
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

          static [DefinitionContext__symbol]: Partial<DefinitionContext> = {
            elementDef: {
              name: undefined,
              tagName: undefined,
              extend: {
                type: BaseElement,
              },
            },
          };

        }

        (TestComponent as any)[DefinitionContext__symbol] = {
          elementDef: {
            name: 'test-component',
            tagName: 'test-component',
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

        (TestComponent as any)[DefinitionContext__symbol] = {
          elementDef: {
            name: 'test-component',
            tagName: 'test-component',
            extend: {
              name: 'input',
              type: BaseElement,
            },
          },
        };

        customElements.define(TestComponent, elementType);

        expect(mockCustomElements.define).toHaveBeenCalledWith(
            'test-component',
            elementType,
            {
              extends: 'input',
            },
        );
      });
    });

    describe('whenDefined', () => {
      it('awaits for component definition', async () => {

        const promise = Promise.resolve('defined');

        mockCustomElements.whenDefined.mockReturnValue(promise as Promise<unknown> as Promise<void>);

        expect(await customElements.whenDefined(TestComponent)).toBe('defined');
        expect(mockCustomElements.whenDefined).toHaveBeenCalledWith('test-component');
      });
      it('waits for component definition in namespace', async () => {

        const ns = new NamespaceDef('test/url', 'test');

        class NsComponent {

          static [DefinitionContext__symbol]: Partial<DefinitionContext> = {
            elementDef: {
              name: ['other', ns],
              tagName: 'test-other',
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
      it('awaits for non-component element definition', async () => {

        const promise = Promise.resolve<any>('defined');

        mockCustomElements.whenDefined.mockReturnValue(promise as Promise<unknown> as Promise<void>);

        expect(await customElements.whenDefined('test-component')).toBe('defined');
        expect(mockCustomElements.whenDefined).toHaveBeenCalledWith('test-component');
      });
      it('awaits for non-component element definition in namespace', async () => {

        const ns = new NamespaceDef('test/url', 'test');
        const promise = Promise.resolve<any>('defined');

        mockCustomElements.whenDefined.mockReturnValue(promise as Promise<unknown> as Promise<void>);

        expect(await customElements.whenDefined(['other', ns])).toBe('defined');
        expect(mockCustomElements.whenDefined).toHaveBeenCalledWith('test-other');
      });
      it('waits for anonymous component definition', async () => {

        class AnonymousComponent {

          static [DefinitionContext__symbol]: Partial<DefinitionContext> = {
            elementDef: {
              name: undefined,
              tagName: undefined,
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
