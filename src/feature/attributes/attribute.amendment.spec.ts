import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { valueProvider } from '@proc7ts/primitives';
import { Component, ComponentContext, ComponentContext__symbol } from '../../component';
import { MockObject } from '../../spec';
import { Attribute } from './attribute.amendment';

describe('feature/attributes', () => {
  describe('@Attribute', () => {

    let mockContext: ComponentContext;
    let mockElement: MockObject<HTMLElement>;

    beforeEach(() => {
      mockElement = {
        getAttribute: jest.fn(),
        setAttribute: jest.fn(),
        removeAttribute: jest.fn(),
      } as any;
      mockContext = {
        updateState: jest.fn(),
        element: mockElement,
      } as any;
    });

    it('declares attribute field', () => {

      @Component('test-component')
      class TestComponent {

        [ComponentContext__symbol] = valueProvider(mockContext);

        @Attribute()
        testURL!: string;

      }

      const component = new TestComponent();

      mockElement.getAttribute.mockReturnValue('/url1');

      expect(component.testURL).toBe('/url1');

      component.testURL = '/url2';
      expect(mockElement.setAttribute).toHaveBeenCalledWith('test-url', '/url2');
    });
    it('declares attribute property', () => {

      @Component('test-component')
      class TestComponent {

        [ComponentContext__symbol] = valueProvider(mockContext);

        _testAttr?: string | null | undefined;

        @Attribute()
        get testAttr(): string | null | undefined {
          return this._testAttr;
        }

        set testAttr(value: string | null | undefined) {
          this._testAttr = value;
        }

      }

      const component = new TestComponent();

      mockElement.getAttribute.mockReturnValue('value1');

      expect(component.testAttr).toBe('value1');

      component.testAttr = 'value2';
      expect(mockElement.setAttribute).toHaveBeenCalledWith('test-attr', 'value2');
      expect(component._testAttr).toBe('value2');

      component.testAttr = null;
      expect(mockElement.removeAttribute).toHaveBeenCalledWith('test-attr');
      expect(component._testAttr).toBeNull();
    });
  });
});
