import { ShadowDomEvent } from './shadow-dom-event';

describe('feature/shadow-dom/shadow-dom-event', () => {
  describe('ShadowDomEvent', () => {

    let element: any;
    let shadowRoot: ShadowRoot;

    beforeEach(() => {
      shadowRoot = { name: 'shadow root' } as any;
      element = { shadowRoot };
    });

    let event: ShadowDomEvent;

    beforeEach(() => {
      event = new ShadowDomEvent('wesib:shadowAttached');
      Object.defineProperty(event, 'target', { value: element });
    });

    describe('shadowRoot', () => {
      it('returns target element shadow root', () => {
        expect(event.shadowRoot).toBe(shadowRoot);
      });
    });
  });
});
