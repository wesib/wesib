import { StatePath } from 'fun-events';
import { Component, ComponentClass, ComponentContext } from '../../component';
import { testElement } from '../../spec/test-element';
import { DomMethod, DomProperty } from './dom-property.decorator';
import Spy = jasmine.Spy;

describe('features/dom-properties', () => {
  describe('DOM properties usage', () => {

    let testComponent: ComponentClass;
    let context: ComponentContext;
    let element: any;
    let propertyValue: number;
    let customUpdateStateSpy: Spy;
    let customUpdateStatePath: StatePath;

    beforeEach(() => {
      context = undefined!;
      propertyValue = 0;
      customUpdateStateSpy = jasmine.createSpy('customUpdateState');
      customUpdateStatePath = ['custom', 'key'];

      @Component({
        extend: {
          type: Object,
        },
        name: 'test-component',
      })
      class TestComponent {

        @DomProperty()
        field = 'initial';

        @DomProperty({ updateState: false })
        nonStateUpdating = [0];

        @DomProperty({ updateState: customUpdateStateSpy })
        customStateUpdatingField = 91;

        @DomProperty({ updateState: customUpdateStatePath })
        customStatePathField = 911;

        constructor(ctx: ComponentContext) {
          context = ctx;
          this.writableProperty = 11;
        }

        @DomProperty()
        get readonlyProperty() {
          return propertyValue;
        }

        get writableProperty() {
          return propertyValue;
        }

        @DomProperty()
        set writableProperty(value: number) {
          propertyValue = value;
        }

        @DomMethod({ propertyKey: 'elementMethod' })
        componentMethod(...args: string[]): string {
          return `${this.readonlyProperty}: ${args.join(', ')}`;
        }

      }

      testComponent = TestComponent;
    });

    beforeEach(() => {
      element = new (testElement(testComponent))();
    });

    it('reads component property', () => {
      expect(element.readonlyProperty).toBe(propertyValue);
      propertyValue = 1;
      expect(element.readonlyProperty).toBe(propertyValue);
    });
    it('writes component property', () => {
      expect(element.writableProperty).toBe(propertyValue);
      element.writableProperty = 1;
      expect(propertyValue).toBe(1);
    });

    it('updates the component state on property update', () => {

      const updateStateSpy = spyOn(context, 'updateState');

      element.writableProperty = 1;

      expect(updateStateSpy).toHaveBeenCalledWith([StatePath.property, 'writableProperty'], 1, 11);
    });
    it('reads component field', () => {
      expect(element.field).toBe('initial');
    });
    it('writes component field', () => {
      element.field = 'new';
      expect(element.field).toBe('new');
    });
    it('updates the component state on field update', () => {

      const updateStateSpy = spyOn(context, 'updateState');

      element.field = 'new';

      expect(updateStateSpy).toHaveBeenCalledWith([StatePath.property, 'field'], 'new', 'initial');
    });
    it('does not update the component state when disabled', () => {

      const updateStateSpy = spyOn(context, 'updateState');

      element.nonStateUpdating = [1, 2];

      expect(element.nonStateUpdating).toEqual([1, 2]);
      expect(updateStateSpy).not.toHaveBeenCalled();
    });
    it('updates the component state with custom function', () => {

      const updateStateSpy = spyOn(context, 'updateState');

      element.customStateUpdatingField = 19;

      expect(element.customStateUpdatingField).toEqual(19);
      expect(updateStateSpy).not.toHaveBeenCalled();
      expect(customUpdateStateSpy).toHaveBeenCalledWith([StatePath.property, 'customStateUpdatingField'], 19, 91);
      expect(customUpdateStateSpy.calls.first().object).toBe(ComponentContext.of(element).component);
    });
    it('updates the component state with custom path', () => {

      const updateStateSpy = spyOn(context, 'updateState');

      element.customStatePathField = 119;

      expect(element.customStatePathField).toEqual(119);
      expect(updateStateSpy).toHaveBeenCalledWith(customUpdateStatePath, 119, 911);
    });
    it('calls component method', () => {
      expect(element.elementMethod('1', '2', '3')).toBe(`${propertyValue}: 1, 2, 3`);
    });
    it('does not update the component state on method call', () => {

      const updateStateSpy = spyOn(context, 'updateState');

      element.elementMethod('1', '2', '3');

      expect(updateStateSpy).not.toHaveBeenCalled();
    });
  });
});
