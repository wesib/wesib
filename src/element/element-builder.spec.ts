import { ComponentDesc, componentDesc } from '../component';
import { ElementBuilder } from './element-builder';

describe('element/element-builder', () => {
  describe('ElementBuilder', () => {

    let builder: ElementBuilder;

    beforeEach(() => {
      builder = new ElementBuilder();
    });

    describe('buildElement', () => {
      it('builds HTML element', () => {

        class TestElement {
          static [componentDesc]: ComponentDesc = {
            name: 'test-element',
          };
        }

        expect(builder.buildElement(TestElement).prototype instanceof HTMLElement).toBeTruthy();
      });
      it('extends HTML element', () => {

        class TestElement {
          static [componentDesc]: ComponentDesc = {
            name: 'test-element',
            extend: {
              name: 'input',
              type: HTMLInputElement,
            },
          };
        }

        expect(builder.buildElement(TestElement).prototype instanceof HTMLInputElement).toBeTruthy();
      });
    });
  });
});
