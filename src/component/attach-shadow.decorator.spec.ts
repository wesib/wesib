import { testElement } from '../spec/test-element';
import { AttachShadow } from './attach-shadow.decorator';
import { ComponentClass } from './component';
import { ComponentContext } from './component-context';
import { WesComponent } from './wes-component.decorator';
import Spy = jasmine.Spy;

describe('component/attach-shadow.decorator', () => {
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

    it('provides shadow root', () => {
      expect(context.get(ComponentContext.shadowRootKey)).toBe(shadowRoot);
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
  });
});
