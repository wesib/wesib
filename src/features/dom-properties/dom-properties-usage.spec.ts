import { StateValueKey } from '../../common';
import { Component, ComponentClass, ComponentContext, WesComponent } from '../../component';
import { TestBootstrap } from '../../spec/test-bootstrap';
import { DomMethod, DomProperty } from './dom-property.decorator';
import Spy = jasmine.Spy;

describe('features/dom-properties', () => {
  describe('DOM properties usage', () => {

    let bootstrap: TestBootstrap;
    let testComponent: ComponentClass;
    let context: ComponentContext;
    let element: HTMLElement;
    let propertyValue: number;
    let customUpdateStateSpy: Spy;
    let customUpdateStateKey: StateValueKey;

    beforeEach(() => {
      context = undefined!;
      propertyValue = 0;
      customUpdateStateSpy = jasmine.createSpy('customUpdateState');
      customUpdateStateKey = ['custom', 'key'];

      @WesComponent({ name: 'test-component' })
      class TestComponent {

        @DomProperty()
        field = 'initial';

        @DomProperty({ updateState: false })
        nonStateUpdating = [0];

        @DomProperty({ updateState: customUpdateStateSpy })
        customStateUpdatingField = 91;

        @DomProperty({ updateState: customUpdateStateKey })
        customStateKeyField = 911;

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

        @DomMethod({ name: 'elementMethod' })
        componentMethod(...args: string[]): string {
          return `${this.readonlyProperty}: ${args.join(', ')}`;
        }

      }

      testComponent = TestComponent;
    });

    beforeEach(async () => {
      bootstrap = await new TestBootstrap().create(testComponent);
      element = await bootstrap.addElement(testComponent);
    });
    afterEach(() => bootstrap.dispose());

    it('reads component property', () => {
      expect((element as any).readonlyProperty).toBe(propertyValue);
      propertyValue = 1;
      expect((element as any).readonlyProperty).toBe(propertyValue);
    });
    it('writes component property', () => {
      expect((element as any).writableProperty).toBe(propertyValue);
      (element as any).writableProperty = 1;
      expect(propertyValue).toBe(1);
    });

    it('updates the component state on property update', () => {

      const updateStateSpy = spyOn(context, 'updateState');

      (element as any).writableProperty = 1;

      expect(updateStateSpy).toHaveBeenCalledWith([StateValueKey.property, 'writableProperty'], 1, 11);
    });
    it('reads component field', () => {
      expect((element as any).field).toBe('initial');
    });
    it('writes component field', () => {
      (element as any).field = 'new';
      expect((element as any).field).toBe('new');
    });
    it('updates the component state on field update', () => {

      const updateStateSpy = spyOn(context, 'updateState');

      (element as any).field = 'new';

      expect(updateStateSpy).toHaveBeenCalledWith([StateValueKey.property, 'field'], 'new', 'initial');
    });
    it('does not update the component state when disabled', () => {

      const updateStateSpy = spyOn(context, 'updateState');

      (element as any).nonStateUpdating = [1, 2];

      expect((element as any).nonStateUpdating).toEqual([1, 2]);
      expect(updateStateSpy).not.toHaveBeenCalled();
    });
    it('updates the component state with custom function', () => {

      const updateStateSpy = spyOn(context, 'updateState');

      (element as any).customStateUpdatingField = 19;

      expect((element as any).customStateUpdatingField).toEqual(19);
      expect(updateStateSpy).not.toHaveBeenCalled();
      expect(customUpdateStateSpy).toHaveBeenCalledWith([StateValueKey.property, 'customStateUpdatingField'], 19, 91);
      expect(customUpdateStateSpy.calls.first().object).toBe(Component.of(element));
    });
    it('updates the component state with custom key', () => {

      const updateStateSpy = spyOn(context, 'updateState');

      (element as any).customStateKeyField = 119;

      expect((element as any).customStateKeyField).toEqual(119);
      expect(updateStateSpy).toHaveBeenCalledWith(customUpdateStateKey, 119, 911);
    });
    it('calls component method', () => {
      expect((element as any).elementMethod('1', '2', '3')).toBe(`${propertyValue}: 1, 2, 3`);
    });
    it('does not update the component state on method call', () => {

      const updateStateSpy = spyOn(context, 'updateState');

      (element as any).elementMethod('1', '2', '3');

      expect(updateStateSpy).not.toHaveBeenCalled();
    });
  });
});
