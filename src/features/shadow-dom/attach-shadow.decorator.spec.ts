import { Component, ComponentClass, ComponentContext } from '../../component';
import { FeatureDef } from '../../feature';
import { testElement } from '../../spec/test-element';
import { AttachShadow } from './attach-shadow.decorator';
import { ShadowContentRoot } from './shadow-content-root';
import { ShadowDomSupport } from './shadow-dom-support.feature';
import Mock = jest.Mock;

describe('features/shadow-dom/attach-shadow.decorator', () => {
  describe('@AttachShadow', () => {

    let testComponent: ComponentClass;
    let attachShadowSpy: Mock;
    let shadowRoot: ShadowContentRoot;
    let element: any;
    let context: ComponentContext;

    beforeEach(() => {
      shadowRoot = { name: 'shadowRoot' } as any;
      attachShadowSpy = jest.fn(() => shadowRoot);

      @AttachShadow()
      @Component({
        name: 'test-component',
        extend: {
          type: class {
            attachShadow = attachShadowSpy;
          },
        }
      })
      class TestComponent {
      }

      testComponent = TestComponent;
    });
    beforeEach(() => {
      element = new (testElement(testComponent))();
      context = ComponentContext.of(element);
    });

    it('enables shadow root support', () => {
      expect(FeatureDef.of(testComponent).need).toBe(ShadowDomSupport);
    });
    it('provides shadow root', () => {
      expect(context.get(ShadowContentRoot)).toBe(shadowRoot);
    });
    it('assigns component context to shadow root', () => {
      expect(ComponentContext.of(context.get(ShadowContentRoot))).toBe(context);
    });
    it('provides shadow root as content root', () => {
      expect(context.contentRoot).toBe(shadowRoot);
    });
    it('attaches open shadow root by default', () => {
      expect(attachShadowSpy).toHaveBeenCalledWith({ mode: 'open' });
    });
    it('attaches shadow root', () => {
      attachShadowSpy.mockClear();

      const init: ShadowRootInit = {
        mode: 'closed',
      };

      @AttachShadow(init)
      @Component({
        name: 'other-component',
        extend: {
          type: class {
            attachShadow = attachShadowSpy;
          },
        }
      })
      class OtherComponent {
      }

      element = new (testElement(OtherComponent))();

      expect(attachShadowSpy).toHaveBeenCalledWith(init);
    });
    it('uses element as shadow root if shadow DOM is not supported', () => {
      attachShadowSpy.mockClear();

      const init: ShadowRootInit = {
        mode: 'closed',
      };

      @AttachShadow(init)
      @Component({
        name: 'other-component',
        extend: {
          type: Object,
        }
      })
      class OtherComponent {
      }

      element = new (testElement(OtherComponent))();
      context = ComponentContext.of(element);

      expect(context.get(ShadowContentRoot)).toBe(element);
    });
  });
});
