import Mock = jest.Mock;
import { Component, ComponentMount } from '../../component';
import { ComponentFactory } from '../../component/definition';
import { ElementAdapter } from '../../kit';
import { ObjectMock } from '../../spec/mocks';
import { MockElement, testComponentFactory } from '../../spec/test-element';
import { Feature } from '../feature.decorator';
import { ShadowDomEvent } from '../shadow-dom';
import { AutoConnectSupport } from './auto-connect-support.feature';

describe('feature/autoconnect', () => {
  describe('ConnectTracker', () => {

    let MockObserver: Mock;
    let observer: ObjectMock<MutationObserver>;
    let update: (records: Partial<MutationRecord>[]) => void;

    beforeEach(() => {
      observer = {
        observe: jest.fn(),
        disconnect: jest.fn(),
      } as any;
      MockObserver = jest.fn((callback: (records: Partial<MutationRecord>[]) => void) => {
        update = callback;
        return observer;
      });
      (window as any).MutationObserver = MockObserver;
    });

    let element: Element;

    beforeEach(() => {
      element = document.createElement('div');
    });

    let adapter: Mock;

    beforeEach(() => {
      adapter = jest.fn();
    });

    let factory: ComponentFactory;

    beforeEach(async () => {

      @Feature({
        need: AutoConnectSupport,
        set: { a: ElementAdapter, is: adapter },
      })
      @Component({
        name: 'test-component',
        extend: {
          type: MockElement,
        },
      })
      class TestComponent {}

      factory = await testComponentFactory(TestComponent);
    });

    it('starts tracking', () => {
      expect(MockObserver).toHaveBeenCalledWith(update);
      expect(observer.observe).toHaveBeenCalledWith(document.body, { childList: true, subtree: true });
    });
    it('connects when element is added to document', async () => {

      const mount = factory.mountTo(element);

      expect(mount.connected).toBe(false);

      document.body.appendChild(element);
      update([{ type: 'childList', addedNodes: [element] as any, removedNodes: [] as any }]);

      expect(mount.connected).toBe(true);
    });
    it('consults element adapter', () => {
      document.body.appendChild(element);
      update([{ type: 'childList', addedNodes: [element] as any, removedNodes: [] as any }]);

      expect(adapter).toHaveBeenCalledWith(element);
    });
    it('adapts added element', () => {

      let mount: ComponentMount = undefined!;

      adapter.mockImplementation((el: any) => {
        mount = factory.mountTo(el);
        return mount.context;
      });

      document.body.appendChild(element);
      update([{ type: 'childList', addedNodes: [element] as any, removedNodes: [] as any }]);

      expect(adapter).toHaveBeenCalledWith(element);
      expect(mount.connected).toBe(true);
    });
    it('disconnects when element is removed from document', async () => {
      document.body.appendChild(element);

      const mount = factory.mountTo(element);

      expect(mount.connected).toBe(true);

      element.remove();
      update([{ type: 'childList', addedNodes: [] as any, removedNodes: [element] as any }]);

      expect(mount.connected).toBe(false);
    });
    it('tracks existing shadow root', () => {

      const shadowRoot = document.createElement('div');

      (element.shadowRoot as any) = shadowRoot;

      factory.mountTo(element);

      document.body.appendChild(element);
      update([{ type: 'childList', addedNodes: [element] as any, removedNodes: [] as any }]);

      expect(observer.observe).toHaveBeenCalledWith(shadowRoot, { childList: true, subtree: true });
    });
    it('tracks attached shadow root', () => {
      document.body.appendChild(element);
      factory.mountTo(element);

      const shadowRoot = document.createElement('div');

      (element.shadowRoot as any) = shadowRoot;
      element.dispatchEvent(new ShadowDomEvent('wesib:shadowAttached', { bubbles: true }));

      expect(observer.observe).toHaveBeenCalledWith(shadowRoot, { childList: true, subtree: true });
    });
    it('stops shadow root tracking on component removal', () => {
      (element.shadowRoot as any) = document.createElement('div');
      factory.mountTo(element);

      document.body.appendChild(element);
      update([{ type: 'childList', addedNodes: [element] as any, removedNodes: [] as any }]);
      element.remove();
      update([{ type: 'childList', addedNodes: [] as any, removedNodes: [element] as any }]);

      expect(observer.disconnect).toHaveBeenCalled();
    });
    it('stops shadow root tracking only once', () => {
      (element.shadowRoot as any) = document.createElement('div');
      factory.mountTo(element);

      document.body.appendChild(element);
      update([{ type: 'childList', addedNodes: [element] as any, removedNodes: [] as any }]);
      element.remove();
      update([{ type: 'childList', addedNodes: [] as any, removedNodes: [element] as any }]);
      update([{ type: 'childList', addedNodes: [] as any, removedNodes: [element] as any }]);

      expect(observer.disconnect).toHaveBeenCalledTimes(1);
    });
  });
});
