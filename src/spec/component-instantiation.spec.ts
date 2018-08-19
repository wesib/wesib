import { ComponentContext, ComponentType } from '../component';
import { ElementMethod, ElementProperty, WebComponent } from '../decorators';
import { componentOf } from '../element';
import { TestComponents } from './test-components';
import Spy = jasmine.Spy;

describe('component instantiation', () => {

  let components: TestComponents;
  let TestComponent: ComponentType;
  let constructorSpy: Spy;
  let context: ComponentContext<HTMLElement>;
  let attrChangedSpy: Spy;
  let attr2ChangedSpy: Spy;
  let element: HTMLElement;
  let propertyValue: number;

  beforeEach(async () => {
    components = await new TestComponents().create();
  });
  afterEach(() => components.dispose());

  beforeEach(() => {
    context = undefined!;
    constructorSpy = jasmine.createSpy('constructor')
        .and.callFake((ctx: ComponentContext<HTMLElement>) => context = ctx);
    attrChangedSpy = jasmine.createSpy('attrChanged');
    attr2ChangedSpy = jasmine.createSpy('attr2Changed');
    propertyValue = 0;

    @WebComponent({
      name: 'custom-component',
      attributes: {
        'custom-attribute': attrChangedSpy,
        'custom-attribute-2': attr2ChangedSpy,
      },
      properties: {
        tagName: {
          value: 'MODIFIED-CUSTOM-COMPONENT',
        }
      },
    })
    class Component {
      constructor(...args: any[]) {
        constructorSpy(...args);
      }

      @ElementProperty()
      get readonlyProperty() {
        return propertyValue;
      }

      get writableProperty() {
        return propertyValue;
      }

      @ElementProperty()
      set writableProperty(value: number) {
        propertyValue = value;
      }

      @ElementMethod({ name: 'elementMethod' })
      componentMethod(...args: string[]): string {
        return `${this.readonlyProperty}: ${args.join(', ')}`;
      }

    }

    TestComponent = Component;
  });
  beforeEach(async () => {
    element = await components.addElement(TestComponent);
  });

  it('instantiates custom element', async () => {
    expect(element).toBeDefined();
  });
  it('assigns component reference to custom element', () => {
    expect(componentOf(element)).toEqual(jasmine.any(TestComponent));
  });
  it('passes context to component', () => {

    const expectedContext: Partial<ComponentContext<HTMLElement>> = {
      element,
    };

    expect(constructorSpy).toHaveBeenCalledWith(jasmine.objectContaining(expectedContext));
  });
  it('notifies on attribute change', () => {
    element.setAttribute('custom-attribute', 'value1');
    expect(attrChangedSpy).toHaveBeenCalledWith(null, 'value1');

    attrChangedSpy.calls.reset();
    element.setAttribute('custom-attribute', 'value2');
    expect(attrChangedSpy).toHaveBeenCalledWith('value1', 'value2');
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
  it('defines properties', () => {
    expect(element.tagName).toEqual('MODIFIED-CUSTOM-COMPONENT');
  });
  it('allows to access inherited element properties', () => {
    expect(context.elementSuper('tagName')).toEqual('CUSTOM-COMPONENT');
  });
  it('reads element property', () => {
    expect((element as any).readonlyProperty).toBe(propertyValue);
    propertyValue = 1;
    expect((element as any).readonlyProperty).toBe(propertyValue);
  });
  it('writes element property', () => {
    expect((element as any).writableProperty).toBe(propertyValue);
    (element as any).writableProperty = 1;
    expect(propertyValue).toBe(1);
  });
  it('calls component method', () => {
    expect((element as any).elementMethod('1', '2', '3')).toBe(`${propertyValue}: 1, 2, 3`);
  });
});
