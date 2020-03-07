import { itsEmpty, overArray } from 'a-iterable';
import { Component } from '../../component';
import { ComponentFactory } from '../../component/definition';
import { MockElement, testComponentFactory } from '../../spec/test-element';
import { bootstrapComponents } from '../bootstrap';
import { ElementObserver } from './element-observer';
import Mock = jest.Mock;

describe('boot', () => {
  describe('ElementObserver', () => {

    let factory: ComponentFactory;

    beforeEach(async () => {

      @Component({
        name: 'test-component',
        extend: {
          type: MockElement,
        },
      })
      class TestComponent {}

      factory = await testComponentFactory(TestComponent);
    });

    let root: Element;

    beforeEach(() => {
      root = document.createElement('test-root');
      document.body.appendChild(root);
    });
    afterEach(() => {
      root.remove();
    });

    let lastMutations: MutationRecord[];
    let lastMutation: MutationRecord;
    let observer: ElementObserver;
    let callback: Mock<void, [MutationRecord[], MutationObserver]>;

    beforeEach(async () => {
      callback = jest.fn((mutations, _observer) => {
        lastMutations = mutations;
        [lastMutation] = mutations;
      });

      const bsContext = await bootstrapComponents().whenReady;

      observer = bsContext.get(ElementObserver)(callback);
    });
    afterEach(() => {
      observer.disconnect();
    });

    let element: Element;

    beforeEach(() => {
      element = document.createElement('div');
    });

    describe('observe', () => {
      it('observers child list', () => {

        const spy = jest.spyOn(MutationObserver.prototype, 'observe');

        observer.observe(root);
        expect(spy).toHaveBeenCalledWith(root, { childList: true });
      });
    });

    describe('observing', () => {
      beforeEach(() => {
        observer.observe(root);
      });

      it('reports element addition', async () => {
        root.appendChild(element);
        await Promise.resolve();

        expect(callback).toHaveBeenLastCalledWith(lastMutations, observer);
        expect(lastMutations).toHaveLength(1);
        expect(lastMutation.type).toBe('childList');
        expect([...overArray(lastMutation.addedNodes)]).toEqual([element]);
        expect(itsEmpty(overArray(lastMutation.removedNodes))).toBe(true);
      });
      it('reports element removal', async () => {
        root.appendChild(element);
        await Promise.resolve();
        element.remove();
        await Promise.resolve();

        expect(callback).toHaveBeenLastCalledWith(lastMutations, observer);
        expect(lastMutations).toHaveLength(1);
        expect(lastMutation.type).toBe('childList');
        expect(itsEmpty(overArray(lastMutation.addedNodes))).toBe(true);
        expect([...overArray(lastMutation.removedNodes)]).toEqual([element]);
      });
      it('connects when element is added to document', async () => {

        const mount = factory.mountTo(element);

        expect(mount.connected).toBe(false);

        root.appendChild(element);
        await Promise.resolve();

        expect(mount.connected).toBe(true);
      });
      it('disconnects when element is removed from document', async () => {
        root.appendChild(element);

        const mount = factory.mountTo(element);

        await Promise.resolve();
        expect(mount.connected).toBe(true);

        element.remove();
        await Promise.resolve();

        expect(mount.connected).toBe(false);
      });
    });
  });
});