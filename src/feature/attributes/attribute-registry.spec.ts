import { Class } from '@proc7ts/primitives';
import { bootstrapComponents } from '../../boot/bootstrap';
import { Component, ComponentContext, ComponentContext__symbol } from '../../component';
import { ComponentClass } from '../../component/definition';
import { attributePathTo } from './attribute-path';
import { Attributes } from './attributes.decorator';

describe('feature/attributes', () => {
  describe('AttributeRegistry', () => {

    it('declares `observedAttributes` static property', async () => {

      @Attributes('test-attr-1', 'test-attr-2')
      class TestComponent {}

      const elementType = await bootstrap(TestComponent);

      expect(elementType).toHaveProperty('observedAttributes', ['test-attr-1', 'test-attr-2']);
    });
    it('inherits observed attributes', async () => {

      class BaseElement {

        static observedAttributes = ['inherited-attr'];

      }

      @Component({
        extend: {
          type: BaseElement,
        },
      })
      @Attributes('firstTestAttr', 'secondTestAttr')
      class TestComponent {}

      const elementType = await bootstrap(TestComponent);

      expect(elementType).toHaveProperty(
          'observedAttributes',
          ['inherited-attr', 'first-test-attr', 'second-test-attr'],
      );
    });
    it('declares `attributeChangedCallback` method', async () => {

      const attrChanged = jest.fn();

      @Attributes({ testAttr: attrChanged })
      class TestComponent {}

      const elementType = await bootstrap(TestComponent);
      const callback: any = elementType.prototype.attributeChangedCallback;
      const element = { [ComponentContext__symbol]: { component: { name: 'component' } } };

      callback.call(element, 'test-attr', 'old', 'new');
      expect(attrChanged).toHaveBeenCalledWith(
          ComponentContext.of(element).component,
          attributePathTo('test-attr'),
          'new',
          'old',
      );
    });
    it('inherits attribute change callback', async () => {

      class BaseElement {

        static observedAttributes = ['inherited-attr'];

        attributeChangedCallback(
            _name: string,
            _newValue: string | null,
            _oldValue: string | null,
        ): void {/* attribute changed */}

      }

      const inheritedAttrChanged = jest.spyOn(BaseElement.prototype, 'attributeChangedCallback');
      const attrChanged = jest.fn();

      @Component({
        extend: {
          type: BaseElement,
        },
      })
      @Attributes({ testAttr: attrChanged })
      class TestComponent {}

      const elementType = await bootstrap(TestComponent);
      const callback: any = elementType.prototype.attributeChangedCallback;
      const element = { [ComponentContext__symbol]: { component: { name: 'component' } } };

      callback.call(element, 'test-attr', 'old', 'new');
      expect(attrChanged).toHaveBeenCalledWith(
          ComponentContext.of(element).component,
          attributePathTo('test-attr'),
          'new',
          'old',
      );

      callback.call(element, 'inherited-attr', 'old', 'new');
      expect(inheritedAttrChanged).toHaveBeenCalledWith('inherited-attr', 'old', 'new');
      expect(inheritedAttrChanged.mock.instances[0]).toBe(element);
    });
  });

  async function bootstrap(component: ComponentClass): Promise<Class> {

    const bsContext = await bootstrapComponents(component).whenReady();
    const defContext = await bsContext.whenDefined(component);

    return defContext.elementType;
  }
});
