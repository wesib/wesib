import Mock = jest.Mock;
import Mocked = jest.Mocked;
import { Component } from '../../component';
import { ComponentFactory } from '../../component/definition';
import { MockElement, testComponentFactory } from '../../spec/test-element';
import { Feature } from '../feature.decorator';
import { AutoConnectSupport } from './auto-connect-support.feature';

describe('feature/autoconnect', () => {
  describe('ConnectTracker', () => {

    let MockObserver: Mock;
    let observer: Mocked<MutationObserver>;
    let update: (records: Partial<MutationRecord>[]) => void;

    beforeEach(() => {
      observer = {
        observe: jest.fn(),
      } as any;
      MockObserver = jest.fn((callback: (records: Partial<MutationRecord>[]) => void) => {
        update = callback;
        return observer;
      });
      (window as any).MutationObserver = MockObserver;
    });

    let element: Element;
    let factory: ComponentFactory;

    beforeEach(() => {
      element = document.createElement('div');
    });

    beforeEach(async () => {

      @Feature({
        need: AutoConnectSupport,
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
    it('disconnects when element is removed from document', async () => {
      document.body.appendChild(element);

      const mount = factory.mountTo(element);

      expect(mount.connected).toBe(true);

      element.remove();
      update([{ type: 'childList', addedNodes: [] as any, removedNodes: [element] as any }]);

      expect(mount.connected).toBe(false);
    });
  });
});
