import Mock = jest.Mock;
import Mocked = jest.Mocked;
import { BootstrapRoot, ElementObserver } from '../../boot/globals';
import { Component } from '../../component';
import { DefinitionContext } from '../../component/definition';
import { MockElement, testDefinition } from '../../spec/test-element';
import { Feature } from '../feature.decorator';
import { ShadowDomEvent } from '../shadow-dom';
import { AutoConnectSupport } from './auto-connect-support.feature';

describe('feature/autoconnect', () => {
  describe('ConnectTracker', () => {

    let root: Element;

    beforeEach(() => {
      root = document.createElement('test-root');
      document.body.appendChild(root);
    });
    afterEach(() => {
      root.remove();
    });

    let newObserver: Mock<ElementObserver, [MutationCallback]>;
    let observer: Mocked<ElementObserver>;
    let update: (records: Partial<MutationRecord>[]) => void;

    beforeEach(() => {
      observer = {
        observe: jest.fn(),
        disconnect: jest.fn(),
      } as any;
      newObserver = jest.fn((callback: MutationCallback) => {
        update = callback as (records: Partial<MutationRecord>[]) => void;
        return observer;
      });
    });

    let element: Element;

    beforeEach(() => {
      element = document.createElement('div');
    });

    let defContext: DefinitionContext;

    beforeEach(async () => {

      @Feature({
        needs: AutoConnectSupport,
        setup(setup) {
          setup.provide({ a: ElementObserver, is: newObserver });
          setup.provide({ a: BootstrapRoot, is: root });
        },
      })
      @Component({
        name: 'test-component',
        extend: {
          type: MockElement,
        },
      })
      class TestComponent {}

      defContext = await testDefinition(TestComponent);
    });

    it('starts tracking', () => {
      expect(newObserver).toHaveBeenCalledWith(update);
      expect(observer.observe).toHaveBeenCalledWith(root, { subtree: true });
    });
    it('tracks simple element', () => {
      root.appendChild(element);
      update([{ type: 'childList', addedNodes: [element] as any, removedNodes: [] as any }]);
      element.remove();
      update([{ type: 'childList', addedNodes: [] as any, removedNodes: [element] as any }]);
      expect(newObserver).toHaveBeenCalledTimes(1);
      expect(observer.observe).toHaveBeenCalledTimes(1);
    });
    it('tracks existing shadow root', () => {

      const shadowRoot = element.attachShadow({ mode: 'closed' });

      jest.spyOn(element, 'shadowRoot', 'get').mockImplementation(() => shadowRoot);

      defContext.mountTo(element);
      root.appendChild(element);
      update([{ type: 'childList', addedNodes: [element] as any, removedNodes: [] as any }]);

      expect(observer.observe).toHaveBeenCalledWith(shadowRoot, { subtree: true });
    });
    it('tracks attached shadow root', () => {
      root.appendChild(element);
      defContext.mountTo(element);

      const shadowRoot = element.attachShadow({ mode: 'closed' });

      jest.spyOn(element, 'shadowRoot', 'get').mockImplementation(() => shadowRoot);
      element.dispatchEvent(new ShadowDomEvent('wesib:shadowAttached', { bubbles: true }));

      expect(observer.observe).toHaveBeenCalledWith(shadowRoot, { subtree: true });
      expect(observer.observe).toHaveBeenCalledTimes(2);
    });
    it('starts shadow root tracking only once', () => {
      root.appendChild(element);
      defContext.mountTo(element);

      const shadowRoot = element.attachShadow({ mode: 'closed' });

      jest.spyOn(element, 'shadowRoot', 'get').mockImplementation(() => shadowRoot);
      element.dispatchEvent(new ShadowDomEvent('wesib:shadowAttached', { bubbles: true }));
      element.dispatchEvent(new ShadowDomEvent('wesib:shadowAttached', { bubbles: true }));

      expect(observer.observe).toHaveBeenCalledTimes(2);
    });
    it('stops shadow root tracking on component removal', () => {

      const shadowRoot = element.attachShadow({ mode: 'closed' });

      jest.spyOn(element, 'shadowRoot', 'get').mockImplementation(() => shadowRoot);
      defContext.mountTo(element);

      root.appendChild(element);
      update([{ type: 'childList', addedNodes: [element] as any, removedNodes: [] as any }]);
      element.remove();
      update([{ type: 'childList', addedNodes: [] as any, removedNodes: [element] as any }]);

      expect(observer.disconnect).toHaveBeenCalled();
    });
    it('stops shadow root tracking only once', () => {

      const shadowRoot = element.attachShadow({ mode: 'closed' });

      jest.spyOn(element, 'shadowRoot', 'get').mockImplementation(() => shadowRoot);
      defContext.mountTo(element);

      root.appendChild(element);
      update([{ type: 'childList', addedNodes: [element] as any, removedNodes: [] as any }]);
      element.remove();
      update([{ type: 'childList', addedNodes: [] as any, removedNodes: [element] as any }]);
      update([{ type: 'childList', addedNodes: [] as any, removedNodes: [element] as any }]);

      expect(observer.disconnect).toHaveBeenCalledTimes(1);
    });
  });
});
