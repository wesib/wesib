import { parentElement } from './parent-element';

describe('common', () => {
  describe('parentElement', () => {
    it('returns parent element', () => {

      const parent = document.createElement('div');
      const child = parent.appendChild(document.createElement('span'));

      expect(parentElement(child)).toBe(parent);
    });
    it('crosses shadow root bounds', () => {

      const parent = document.createElement('div');
      const shadowRoot = parent.attachShadow({ mode: 'closed' });
      const child = shadowRoot.appendChild(document.createElement('span'));

      expect(parentElement(child)).toBe(parent);
    });
    it('returns `null` for detached element', () => {
      expect(parentElement(document.createElement('dev'))).toBeNull();
    });
    it('returns `null` for element inside document fragment', () => {

      const fragment = document.createDocumentFragment();
      const element = fragment.appendChild(document.createElement('div'));

      expect(parentElement(element)).toBeNull();
    });
    it('returns `null` for document element', () => {
      expect(parentElement(document.documentElement)).toBeNull();
    });
  });
});
