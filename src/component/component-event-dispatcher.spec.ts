import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ContextRegistry } from '@proc7ts/context-values';
import { MockElement, testElement } from '../testing';
import { ComponentContext } from './component-context';
import { ComponentEventDispatcher } from './component-event-dispatcher';
import { ComponentSlot } from './component-slot';
import { Component } from './component.amendment';

describe('component', () => {
  describe('ComponentEventDispatcher', () => {

    let element: Element;
    let context: ComponentContext;

    beforeEach(async () => {

      @Component({ extend: { type: MockElement } })
      class TestComponent {
      }

      element = new (await testElement(TestComponent))();
      context = await ComponentSlot.of(element).whenReady;
    });

    let dispatcher: ComponentEventDispatcher;

    beforeEach(() => {

      const registry = new ContextRegistry<ComponentContext>();

      registry.provide({ a: ComponentContext, is: context });
      dispatcher = registry.newValues().get(ComponentEventDispatcher);
    });

    describe('dispatch', () => {
      it('dispatches DOM event', () => {

        const dispatchEventSpy = jest.spyOn(element, 'dispatchEvent');
        const event = new KeyboardEvent('click');

        dispatcher.dispatch(event);

        expect(dispatchEventSpy).toHaveBeenCalledWith(event);
      });
      it('dispatches DOM event via component context', () => {

        const dispatchEventSpy = jest.spyOn(element, 'dispatchEvent');
        const event = new KeyboardEvent('click');

        context.dispatchEvent(event);

        expect(dispatchEventSpy).toHaveBeenCalledWith(event);
      });
    });
    describe('on', () => {
      it('registers event listener', () => {

        const addEventListenerSpy = jest.spyOn(element, 'addEventListener');
        const mockListener = jest.fn();

        dispatcher.on('click')(mockListener);
        expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function), undefined);

        const event = new KeyboardEvent('click');

        (addEventListenerSpy.mock.calls[0][1] as EventListener)(event);
        expect(mockListener).toHaveBeenCalledWith(event);
      });
      it('registers event listener via component context', () => {

        const addEventListenerSpy = jest.spyOn(element, 'addEventListener');
        const mockListener = jest.fn();

        context.on('click')(mockListener);
        expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function), undefined);

        const event = new KeyboardEvent('click');

        (addEventListenerSpy.mock.calls[0][1] as EventListener)(event);
        expect(mockListener).toHaveBeenCalledWith(event);
      });
    });
  });
});
