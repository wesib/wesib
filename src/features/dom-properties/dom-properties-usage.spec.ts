import { ComponentType } from '../../component';
import { WebComponent } from '../../decorators';
import { TestBootstrap } from '../../spec/test-bootstrap';
import { DomMethod, DomProperty } from './dom-property';

describe('features/dom-properties', () => {
  describe('DOM properties usage', () => {

    let bootstrap: TestBootstrap;
    let testComponent: ComponentType;
    let element: HTMLElement;
    let propertyValue: number;

    beforeEach(() => {
      propertyValue = 0;

      @WebComponent({ name: 'test-component' })
      class TestComponent {

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
    it('calls component method', () => {
      expect((element as any).elementMethod('1', '2', '3')).toBe(`${propertyValue}: 1, 2, 3`);
    });
  });
});
