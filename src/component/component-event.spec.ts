import { ContextRegistry } from 'context-values';
import { MockElement } from '../spec/test-element';
import { ComponentContext, ComponentContext__symbol } from './component-context';
import { ComponentEvent, ComponentEventDispatcher } from './component-event';

describe('component/component-event', () => {
  describe('ComponentEvent', () => {

    let element: any;
    let componentContext: ComponentContext;

    beforeEach(() => {
      componentContext = { name: 'component context' } as any;
      element = { [ComponentContext__symbol]: componentContext };
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
      } as any;
    });

    let dispatcher: ComponentEventDispatcher;

    beforeEach(() => {
      dispatcher = new ContextRegistry().newValues().get(ComponentEventDispatcher);
    });

    describe('dispatchEvent', () => {
      it('dispatches DOM event', () => {

        const event = new KeyboardEvent('click');

        dispatcher.dispatch(context, event);

        expect(element.dispatchEvent).toHaveBeenCalledWith(event);
      });
    });
    describe('on', () => {
      it('registers event listener', () => {

        const mockListener = jest.fn();

        dispatcher.on(context, 'click')(mockListener);
        expect(element.addEventListener).toHaveBeenCalledWith('click', expect.any(Function), undefined);

        const event = new KeyboardEvent('click');

        element.addEventListener.mock.calls[0][1](event);
        expect(mockListener).toHaveBeenCalledWith(event);
      });
    });
  });
});
