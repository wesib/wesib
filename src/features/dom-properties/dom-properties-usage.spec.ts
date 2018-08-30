import { ComponentContext, ComponentType, ComponentValueKey } from '../../component';
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

    beforeEach(() => {
      context = undefined!;
      propertyValue = 0;

      @WebComponent({ name: 'test-component' })
      class TestComponent {

        @DomProperty()
        field = 'initial';

        @DomProperty({ refreshState: false })
        nonRefreshingField = [0];

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

    function spyOnStateRefresh(): Spy {

      const refreshSpy = jasmine.createSpy('refreshState');
      const actualGet = context.get;

      spyOn(context, 'get').and.callFake(function (this: any, key: ComponentValueKey<any>) {
        if (key === ComponentValueKey.stateRefresh) {
          return refreshSpy;
        }
        return actualGet.apply(this, Function.arguments);
      });

      return refreshSpy;
    }

    it('refreshes the component state on property update', () => {

      const refreshSpy = spyOnStateRefresh();

      (element as any).writableProperty = 1;

      expect(refreshSpy).toHaveBeenCalledWith();
    });
    it('reads component field', () => {
      expect((element as any).field).toBe('initial');
    });
    it('writes component field', () => {
      (element as any).field = 'new';
      expect((element as any).field).toBe('new');
    });
    it('refreshes the component state on field update', () => {

      const refreshSpy = spyOnStateRefresh();

      (element as any).field = 1;

      expect(refreshSpy).toHaveBeenCalledWith();
    });
    it('does not refresh the component state on field update with `refreshState: false`', () => {

      const refreshSpy = spyOnStateRefresh();

      (element as any).nonRefreshingField = [1, 2];

      expect((element as any).nonRefreshingField).toEqual([1, 2]);
      expect(refreshSpy).not.toHaveBeenCalled();
    });
    it('calls component method', () => {
      expect((element as any).elementMethod('1', '2', '3')).toBe(`${propertyValue}: 1, 2, 3`);
    });
    it('does not refresh the component state on method call', () => {

      const refreshSpy = spyOnStateRefresh();

      (element as any).elementMethod('1', '2', '3');

      expect(refreshSpy).not.toHaveBeenCalled();
    });
  });
});
