import { Component, ComponentContext, ComponentType } from '../../component';
import { WebComponent } from '../../decorators';
import { TestBootstrap } from '../../spec/test-bootstrap';
import { DomMethod, DomProperty } from './dom-property';
import Spy = jasmine.Spy;

describe('features/dom-properties', () => {
  describe('DOM properties usage', () => {

    let bootstrap: TestBootstrap;
    let testComponent: ComponentType;
    let context: ComponentContext;
    let element: HTMLElement;
    let propertyValue: number;
    let customRefreshSpy: Spy;

    beforeEach(() => {
      context = undefined!;
      propertyValue = 0;
      customRefreshSpy = jasmine.createSpy('customRefresh');

      @WebComponent({ name: 'test-component' })
      class TestComponent {

        @DomProperty()
        field = 'initial';

        @DomProperty({ refreshState: false })
        nonRefreshingField = [0];

        @DomProperty({ refreshState: customRefreshSpy })
        customRefreshingField = 91;

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

    it('refreshes the component state on property update', () => {

      const refreshSpy = spyOn(context, 'refreshState');

      (element as any).writableProperty = 1;

      expect(refreshSpy).toHaveBeenCalledWith('writableProperty', 1, 11);
    });
    it('reads component field', () => {
      expect((element as any).field).toBe('initial');
    });
    it('writes component field', () => {
      (element as any).field = 'new';
      expect((element as any).field).toBe('new');
    });
    it('refreshes the component state on field update', () => {

      const refreshSpy = spyOn(context, 'refreshState');

      (element as any).field = 'new';

      expect(refreshSpy).toHaveBeenCalledWith('field', 'new', 'initial');
    });
    it('does not refresh the component state when disabled', () => {

      const refreshSpy = spyOn(context, 'refreshState');

      (element as any).nonRefreshingField = [1, 2];

      expect((element as any).nonRefreshingField).toEqual([1, 2]);
      expect(refreshSpy).not.toHaveBeenCalled();
    });
    it('refresh the component state with custom refresh callback', () => {

      const refreshSpy = spyOn(context, 'refreshState');

      (element as any).customRefreshingField = 19;

      expect((element as any).customRefreshingField).toEqual(19);
      expect(refreshSpy).not.toHaveBeenCalled();
      expect(customRefreshSpy).toHaveBeenCalledWith('customRefreshingField', 19, 91);
      expect(customRefreshSpy.calls.first().object).toBe(Component.of(element));
    });
    it('calls component method', () => {
      expect((element as any).elementMethod('1', '2', '3')).toBe(`${propertyValue}: 1, 2, 3`);
    });
    it('does not refresh the component state on method call', () => {

      const refreshSpy = spyOn(context, 'refreshState');

      (element as any).elementMethod('1', '2', '3');

      expect(refreshSpy).not.toHaveBeenCalled();
    });
  });
});
