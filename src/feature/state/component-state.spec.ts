import { describe, expect, it, jest } from '@jest/globals';
import { Component, ComponentContext, ComponentSlot } from '../../component';
import { MockElement, testElement } from '../../testing';
import { ComponentState } from './component-state';

describe('feature/state', () => {
  describe('ComponentState', () => {

    it('is not provided if there is a fallback', async () => {

      const context = await bootstrap();

      expect(context.get(ComponentState, { or: null })).toBeNull();
    });
    it('notifies on state update', async () => {

      const context = await bootstrap();
      const componentState = context.get(ComponentState);
      const onUpdate = jest.fn();
      const supply = componentState.onUpdate(onUpdate);
      const updateState = context.updateState;

      updateState(['key'], 'new', 'old');

      expect(onUpdate).toHaveBeenCalledWith(['key'], 'new', 'old');

      supply.off();
      onUpdate.mockClear();
      updateState('key', 'new', 'old');

      expect(onUpdate).not.toHaveBeenCalled();
    });
    it('notifies on state update with `updateState()` method', async () => {

      const context = await bootstrap();
      const componentState = context.get(ComponentState);
      const onUpdate = jest.fn();
      const supply = componentState.onUpdate(onUpdate);

      context.updateState(['key'], 'new', 'old');

      expect(onUpdate).toHaveBeenCalledWith(['key'], 'new', 'old');

      supply.off();
      onUpdate.mockClear();
      context.updateState('key', 'new', 'old');

      expect(onUpdate).not.toHaveBeenCalled();
    });

    describe('toString', () => {
      it('returns string representation', () => {
        expect(String(ComponentState)).toBe('[ComponentState]');
      });
    });
  });

  async function bootstrap(): Promise<ComponentContext> {
    @Component({
      name: 'test-component',
      extend: {
        type: MockElement,
      },
    })
    class TestComponent {
    }

    const element = new (await testElement(TestComponent))();

    return await ComponentSlot.of(element).whenReady;
  }
});
