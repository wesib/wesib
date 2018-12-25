import { StatePath } from 'fun-events';
import { Component, ComponentClass, ComponentContext } from '../../component';
import { MockElement, testElement } from '../../spec/test-element';
import { Feature } from '../feature.decorator';
import { AttributeChanged } from './attribute-changed.decorator';
import { Attribute } from './attribute.decorator';
import { AttributesSupport } from './attributes-support.feature';
import Mock = jest.Mock;

describe('feature/attributes', () => {
  describe('Attributes usage', () => {

    let testComponent: ComponentClass;
    let context: ComponentContext;
    let element: any;
    let attrChangedSpy: Mock;
    let attr2ChangedSpy: Mock;

    beforeEach(() => {
      context = undefined!;
      attrChangedSpy = jest.fn();
      attr2ChangedSpy = jest.fn();

      @Component({
        extend: {
          type: MockElement,
        },
        name: 'test-component'
      })
      class TestComponent {

        constructor(ctx: ComponentContext) {
          context = ctx;
        }

        @AttributeChanged('custom-attribute')
        attr1 = attrChangedSpy;

        @AttributeChanged('custom-attribute-2')
        attr2 = attr2ChangedSpy;

        @Attribute()
        attr3!: string;

      }

      testComponent = TestComponent;
    });
    beforeEach(() => {
      element = new (testElement(testComponent))();
    });

    it('notifies on attribute change', () => {
      element.setAttribute('custom-attribute', 'value1');
      expect(attrChangedSpy).toHaveBeenCalledWith('value1', null);

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
    it('does not apply attributes when not defined', async () => {

      @Component({
        extend: {
          type: Object,
        },
        name: 'no-attr-component'
      })
      @Feature({
        need: AttributesSupport,
      })
      class NoAttrComponent {
      }

      const noAttrElement = new (testElement(NoAttrComponent))();

      expect(noAttrElement.constructor).not.toEqual(expect.objectContaining({
        observedAttributes: expect.anything(),
      }));
      expect<any>(noAttrElement).not.toMatchObject({
        attributeChangedCallback: expect.anything(),
      });
    });
    it('accesses attribute value', () => {

      const value = 'new value';

      element.setAttribute('attr3', value);

      expect((ComponentContext.of(element).component as any).attr3).toBe(value);
    });
    it('updates attribute value', () => {

      const value = 'new value';

      (ComponentContext.of(element).component as any).attr3 = value;

      expect(element.getAttribute('attr3')).toBe(value);
    });
    it('notifies on attribute update', () => {

      const updateStateSpy = jest.spyOn(context, 'updateState');
      const value = 'new value';

      (ComponentContext.of(element).component as any).attr3 = value;

      expect(updateStateSpy).toHaveBeenCalledWith([StatePath.attribute, 'attr3'], value, null);
    });
  });
});
