import { CustomHTMLElement } from '@frontmeans/dom-primitives';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { StatePath } from '@proc7ts/fun-events';
import { Mock } from 'jest-mock';
import { Component, ComponentContext, ComponentSlot } from '../../component';
import { ComponentClass, DefinitionContext } from '../../component/definition';
import { MockElement, testDefinition, testElement } from '../../testing';
import { DomPropertyUpdateReceiver } from './dom-property-def';
import { DomPropertyPath__root } from './dom-property-path';
import { DomMethod, DomProperty } from './dom-property.amendment';

describe('feature/dom-properties', () => {
  describe('DOM properties usage', () => {

    type TestElement = CustomHTMLElement & {
      field?: string;
      readonly readonlyProperty?: string;
      writableProperty?: number;
      nonStateUpdating?: number[];
      customStateUpdatingField?: number;
      customStatePathField?: number;
      elementMethod?: (...args: string[]) => string;
    };

    let testComponent: ComponentClass;
    let context: ComponentContext;
    let element: TestElement;
    let propertyValue: number;
    let customUpdateStateSpy: Mock<DomPropertyUpdateReceiver<any>>;
    let customUpdateStatePath: StatePath;

    beforeEach(() => {
      context = undefined!;
      propertyValue = 0;
      customUpdateStateSpy = jest.fn();
      customUpdateStatePath = ['custom', 'key'];

      @Component({
        extend: {
          type: MockElement,
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

        constructor() {
          this.writableProperty = 11;
        }

        @DomProperty()
        get readonlyProperty(): number {
          return propertyValue;
        }

        get writableProperty(): number {
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

    describe('constructed element', () => {

      beforeEach(async () => {
        element = new (await testElement(testComponent))();
        context = await ComponentSlot.of(element).whenReady;
      });

      tests();
      it('re-binds component on property access after disconnection', () => {
        jest.spyOn(element, 'getRootNode').mockImplementation(() => element);
        element.disconnectedCallback?.();

        element.field = 'other';
        expect(ComponentSlot.of(element).context).toBeUndefined();

        expect(element.field).toBe('other');

        const context2 = ComponentSlot.of(element).context;

        expect(context2).toBeDefined();
        expect(context2).not.toBe(context);
      });
    });
    describe('mounted element', () => {

      let defContext: DefinitionContext;

      beforeEach(async () => {
        defContext = await testDefinition(testComponent);
        element = document.createElement('test-element') as TestElement;
        context = defContext.mountTo(element);
      });

      tests();
      it('returns `undefined` after component disposal', () => {
        context.supply.off();
        element.field = 'other';
        expect(element.field).toBeUndefined();
      });
    });

    function tests(): void {
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

        const updateStateSpy = jest.spyOn(context, 'updateState');

        element.writableProperty = 1;

        expect(updateStateSpy).toHaveBeenCalledWith([DomPropertyPath__root, 'writableProperty'], 1, 11);
      });
      it('reads component field', () => {
        expect(element.field).toBe('initial');
      });
      it('writes component field', () => {
        element.field = 'new';
        expect(element.field).toBe('new');
      });
      it('updates the component state on value update', () => {

        const updateStateSpy = jest.spyOn(context, 'updateState');

        element.field = 'new';

        expect(updateStateSpy).toHaveBeenCalledWith([DomPropertyPath__root, 'field'], 'new', 'initial');
      });
      it('does not update the component state when value did not change', () => {

        const updateStateSpy = jest.spyOn(context, 'updateState');

        element.field = 'initial';

        expect(updateStateSpy).not.toHaveBeenCalled();
      });
      it('does not update the component state when disabled', () => {

        const updateStateSpy = jest.spyOn(context, 'updateState');

        element.nonStateUpdating = [1, 2];

        expect(element.nonStateUpdating).toEqual([1, 2]);
        expect(updateStateSpy).not.toHaveBeenCalled();
      });
      it('updates the component state with custom function', () => {

        const updateStateSpy = jest.spyOn(context, 'updateState');

        element.customStateUpdatingField = 19;

        expect(element.customStateUpdatingField).toBe(19);
        expect(updateStateSpy).not.toHaveBeenCalled();
        expect(customUpdateStateSpy).toHaveBeenCalledWith(
            context.component,
            [DomPropertyPath__root, 'customStateUpdatingField'],
            19,
            91,
        );
      });
      it('updates the component state with custom path', () => {

        const updateStateSpy = jest.spyOn(context, 'updateState');

        element.customStatePathField = 119;

        expect(element.customStatePathField).toBe(119);
        expect(updateStateSpy).toHaveBeenCalledWith(customUpdateStatePath, 119, 911);
      });
      it('does not update the component state with custom path when value did not change', () => {

        const updateStateSpy = jest.spyOn(context, 'updateState');

        element.customStatePathField = 911;

        expect(element.customStatePathField).toBe(911);
        expect(updateStateSpy).not.toHaveBeenCalled();
      });
      it('calls component method', () => {
        expect(element.elementMethod!('1', '2', '3')).toBe(`${propertyValue}: 1, 2, 3`);
      });
      it('does not update the component state on method call', () => {

        const updateStateSpy = jest.spyOn(context, 'updateState');

        element.elementMethod!('1', '2', '3');

        expect(updateStateSpy).not.toHaveBeenCalled();
      });
    }

  });
});
