import { ComponentContext, ComponentContext__symbol } from './component-context';
import { ComponentEvent } from './component-event';

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
});
