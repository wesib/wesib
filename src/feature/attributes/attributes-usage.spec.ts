import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { cxConstAsset } from '@proc7ts/context-builder';
import { Mock } from 'jest-mock';
import { Component, ComponentContext, ComponentElement, ComponentSlot } from '../../component';
import { ComponentClass, DefinitionContext } from '../../component/definition';
import { BootstrapWindow } from '../../globals';
import { MockFn, MockObject } from '../../spec';
import { MockElement, testDefinition, testElement } from '../../testing';
import { Feature } from '../feature.amendment';
import { AttributeChanged } from './attribute-changed.amendment';
import { AttributeDef } from './attribute-def';
import { AttributePath__root } from './attribute-path';
import { AttributeRegistry } from './attribute-registry';
import { Attribute } from './attribute.amendment';

describe('feature/attributes', () => {
  describe('Attributes usage', () => {

    let Observer: Mock<MutationObserver, [listener: (records: MutationRecord[]) => void]>;
    let observer: MockObject<MutationObserver>;
    let observe: (records: MutationRecord[]) => void;
    let testComponent: ComponentClass;
    let element: any;
    let attrChangedSpy: MockFn<AttributeDef.ChangeMethod>;
    let attr2ChangedSpy: MockFn<AttributeDef.ChangeMethod>;

    beforeEach(() => {
      observer = {
        observe: jest.fn(),
      } as any;
      Observer = jest.fn((listener: (records: MutationRecord[]) => void) => {
        observe = listener;
        return observer;
      });

      attrChangedSpy = jest.fn();
      attr2ChangedSpy = jest.fn();

      @Feature({
        setup(setup) {
          setup.provide(cxConstAsset(BootstrapWindow, { MutationObserver: Observer } as any));
        },
      })
      class TestWindowFeature {}

      @Feature({
        needs: TestWindowFeature,
      })
      @Component({
        extend: {
          type: MockElement,
        },
        name: 'test-component',
      })
      class TestComponent {

        _attr3!: string;

        @AttributeChanged('custom-attribute')
        attr1 = attrChangedSpy;

        @AttributeChanged('custom-attribute-2')
        attr2 = attr2ChangedSpy;

        @Attribute()
        get attr3(): string {
          return this._attr3;
        }

        set attr3(value: string) {
          this._attr3 = value;
        }

      }

      testComponent = TestComponent;
    });

    describe('defined attribute', () => {

      let context: ComponentContext;

      beforeEach(async () => {
        element = new (await testElement(testComponent))();
        context = await ComponentSlot.of(element).whenReady;
      });

      it('notifies on attribute change', () => {
        element.setAttribute('custom-attribute', 'value1');
        expect(attrChangedSpy).toHaveBeenCalledWith('value1', null);
        expect(attrChangedSpy.mock.instances[0]).toBe(context.component);

        attrChangedSpy.mockClear();
        element.setAttribute('custom-attribute', 'value2');
        expect(attrChangedSpy).toHaveBeenCalledWith('value2', 'value1');
      });
      it('does not notify on other attribute change', () => {
        element.setAttribute('custom-attribute-2', 'value');
        expect(attrChangedSpy).not.toHaveBeenCalled();
        expect(attr2ChangedSpy).toHaveBeenCalled();
      });
      it('does not notify on non-declared attribute change', () => {
        element.setAttribute('title', 'test title');
        expect(attrChangedSpy).not.toHaveBeenCalled();
        expect(attr2ChangedSpy).not.toHaveBeenCalled();
      });
      it('does not define attributes when not defined', async () => {

        @Component({
          extend: {
            type: MockElement,
          },
          name: 'no-attr-component',
        })
        class NoAttrComponent {
        }

        const noAttrElement = new (await testElement(NoAttrComponent))();

        expect(noAttrElement.constructor).not.toEqual(expect.objectContaining({
          observedAttributes: expect.anything(),
        }));
        expect(Reflect.ownKeys(noAttrElement.constructor.prototype)).not.toContain('attributeChangedCallback');
      });
      it('accesses attribute value', () => {

        const value = 'new value';

        element.setAttribute('attr3', value);

        expect(context.component._attr3).toBe(value);
        expect(context.component.attr3).toBe(value);
      });
      it('updates attribute value', () => {

        const value = 'new value';

        context.component.attr3 = value;

        expect(element.getAttribute('attr3')).toBe(value);
      });
      it('notifies on attribute update', () => {

        const updateStateSpy = jest.spyOn(context, 'updateState');
        const value = 'new value';

        context.component.attr3 = value;

        expect(updateStateSpy).toHaveBeenCalledWith([AttributePath__root, 'attr3'], value, null);
      });
    });

    describe('mounted attribute', () => {

      let defContext: DefinitionContext;

      beforeEach(async () => {
        defContext = await testDefinition(testComponent);
        element = new MockElement();
        defContext.mountTo(element);
      });

      it('creates mutation observer', () => {
        expect(Observer).toHaveBeenCalledWith(observe);
      });
      it('observes attribute mutations', () => {
        expect(observer.observe).toHaveBeenCalledWith(
            element,
            {
              attributes: true,
              attributeFilter: expect.arrayContaining(['custom-attribute', 'custom-attribute-2', 'attr3']),
              attributeOldValue: true,
            },
        );
      });
      it('updates attribute', () => {
        element.setAttribute('custom-attribute', 'value1');

        const record1 = {
          type: 'attributes',
          attributeName: 'custom-attribute',
          oldValue: null,
        } as MutationRecord;

        observe([record1]);

        expect(attrChangedSpy).toHaveBeenCalledWith('value1', null);

        attrChangedSpy.mockClear();

        element.setAttribute('custom-attribute', 'value2');

        const record2 = {
          type: 'attributes',
          attributeName: 'custom-attribute',
          oldValue: 'value1',
        } as MutationRecord;

        observe([record2]);
        expect(attrChangedSpy).toHaveBeenCalledWith('value2', 'value1');
      });
      it('does not observe attributes when not defined', async () => {
        Observer.mockClear();

        @Component({
          extend: {
            type: Object,
          },
          name: 'no-attr-component',
          define(defContext) {
            defContext.get(AttributeRegistry); // Ensure `AttributeRegistry` created without attributes.
          },
        })
        class NoAttrComponent {
        }

        const noAttrElement = new MockElement() as unknown as ComponentElement<NoAttrComponent>;
        const noAttrDefContext = await testDefinition(NoAttrComponent);

        noAttrDefContext.mountTo(noAttrElement);

        expect(Observer).not.toHaveBeenCalled();
      });
    });
  });
});
