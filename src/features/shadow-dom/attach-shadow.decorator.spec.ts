import { ComponentClass, ComponentContext, WesComponent } from '../../component';
import { FeatureDef } from '../../feature';
import { testElement } from '../../spec/test-element';
import { list2set } from '../../util';
import { AttachShadow } from './attach-shadow.decorator';
import { ShadowDomSupport } from './shadow-dom-support.feature';
import Spy = jasmine.Spy;

describe('features/shadow-dom/attach-shadow.decorator', () => {
  describe('@AttachShadow', () => {

    let testComponent: ComponentClass;
    let attachShadowSpy: Spy;
    let shadowRoot: ShadowRoot;
    let element: any;
    let context: ComponentContext;

    beforeEach(() => {
      shadowRoot = { name: 'shadowRoot' } as any;
      attachShadowSpy = jasmine.createSpy('attachShadow').and.returnValue(shadowRoot);

      @AttachShadow()
      @WesComponent({
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
      expect(list2set(FeatureDef.of(testComponent).require)).toContain(ShadowDomSupport);
    });
    it('provides shadow root', () => {
      expect(context.get(ShadowDomSupport.shadowRootKey)).toBe(shadowRoot);
    });
    it('provides shadow root as content root', () => {
      expect(context.contentRoot).toBe(shadowRoot);
    });
    it('attaches open shadow root by default', () => {
      expect(attachShadowSpy).toHaveBeenCalledWith({ mode: 'open' });
    });
    it('attaches shadow root', () => {
      attachShadowSpy.calls.reset();

      const init: ShadowRootInit = {
        mode: 'closed',
      };

      @AttachShadow(init)
      @WesComponent({
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
      attachShadowSpy.calls.reset();

      const init: ShadowRootInit = {
        mode: 'closed',
      };

      @AttachShadow(init)
      @WesComponent({
        name: 'other-component',
        extend: {
          type: Object,
        }
      })
      class OtherComponent {
      }

      element = new (testElement(OtherComponent))();
      context = ComponentContext.of(element);

      expect(context.get(ShadowDomSupport.shadowRootKey)).toBe(element);
    });
  });
});
