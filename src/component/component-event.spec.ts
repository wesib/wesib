import { ContextRegistry } from '@proc7ts/context-values';
import { Supply } from '@proc7ts/supply';
import { MockElement } from '../spec/test-element';
import { ComponentContext } from './component-context';
import { ComponentEvent, ComponentEventDispatcher } from './component-event';
import { ComponentElement, ComponentSlot } from './component-slot';

describe('component', () => {
  describe('ComponentEvent', () => {

    let element: ComponentElement;
    let componentContext: ComponentContext;

    beforeEach(() => {
      componentContext = { name: 'component context' } as any;
      element = document.createElement('test-element');
      ComponentSlot.of(element).bind(componentContext);
    });

    let event: ComponentEvent;

    beforeEach(() => {
      event = new ComponentEvent('wesib:component');
      Object.defineProperty(event, 'target', { value: element });
    });

    describe('context', () => {
      it('returns target element context', () => {
        expect(event.context).toBe(componentContext);
      });
    });
  });

  describe('ComponentEventDispatcher', () => {

    let element: MockElement;
    let context: ComponentContext;

    beforeEach(() => {
      element = new MockElement();
      context = {
        element,
        supply: new Supply(),
      } as any;
    });

    let dispatcher: ComponentEventDispatcher;

    beforeEach(() => {

      const registry = new ContextRegistry<ComponentContext>();

      registry.provide({ a: ComponentContext, is: context });
      dispatcher = registry.newValues().get(ComponentEventDispatcher);
    });

    describe('dispatchEvent', () => {
      it('dispatches DOM event', () => {

        const event = new KeyboardEvent('click');

        dispatcher.dispatch(event);

        expect(element.dispatchEvent).toHaveBeenCalledWith(event);
      });
    });
    describe('on', () => {
      it('registers event listener', () => {

        const mockListener = jest.fn();

        dispatcher.on('click')(mockListener);
        expect(element.addEventListener).toHaveBeenCalledWith('click', expect.any(Function), undefined);

        const event = new KeyboardEvent('click');

        element.addEventListener.mock.calls[0][1](event);
        expect(mockListener).toHaveBeenCalledWith(event);
      });
    });
  });
});
