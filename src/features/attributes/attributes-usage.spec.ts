import { StatePath } from '../../common';
import { Component, ComponentClass, ComponentContext, WesComponent } from '../../component';
import { TestBootstrap } from '../../spec/test-bootstrap';
import { AttributeChanged } from './attribute-changed.decorator';
import { Attribute } from './attribute.decorator';
import Spy = jasmine.Spy;

describe('features/attributes', () => {
  describe('Attributes usage', () => {

    let bootstrap: TestBootstrap;
    let testComponent: ComponentClass;
    let context: ComponentContext;
    let noAttrComponent: ComponentClass;
    let element: HTMLElement;
    let attrChangedSpy: Spy;
    let attr2ChangedSpy: Spy;

    beforeEach(() => {
      context = undefined!;
      attrChangedSpy = jasmine.createSpy('attrChanged');
      attr2ChangedSpy = jasmine.createSpy('attr2Changed');

      @WesComponent({ name: 'test-component' })
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
      attrChangedSpy = jasmine.createSpy('attrChanged');
      attr2ChangedSpy = jasmine.createSpy('attr2Changed');

      @WesComponent({ name: 'no-attr-component' })
      class NoAttrComponent {
      }

      noAttrComponent = NoAttrComponent;
    });
    beforeEach(async () => {
      bootstrap = await new TestBootstrap().create(testComponent, noAttrComponent);
      element = await bootstrap.addElement(testComponent);
    });
    afterEach(() => bootstrap.dispose());

    it('notifies on attribute change', () => {
      element.setAttribute('custom-attribute', 'value1');
      expect(attrChangedSpy).toHaveBeenCalledWith('value1', null);

      attrChangedSpy.calls.reset();
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

      const noAttrElement = await bootstrap.addElement(noAttrComponent);

      expect(noAttrElement.constructor).not.toEqual(jasmine.objectContaining({
        observedAttributes: jasmine.anything(),
      }));
      expect<any>(noAttrElement).not.toEqual(jasmine.objectContaining({
        attributeChangedCallback: jasmine.anything(),
      }));
    });
    it('accesses attribute value', () => {

      const value = 'new value';

      element.setAttribute('attr3', value);

      expect((Component.of(element) as any).attr3).toBe(value);
    });
    it('updates attribute value', () => {

      const value = 'new value';

      (Component.of(element) as any).attr3 = value;

      expect(element.getAttribute('attr3')).toBe(value);
    });
    it('notifies on attribute update', () => {

      const updateStateSpy = spyOn(context, 'updateState');
      const value = 'new value';

      (Component.of(element) as any).attr3 = value;

      expect(updateStateSpy).toHaveBeenCalledWith([StatePath.attribute, 'attr3'], value, null);
    });
  });
});
