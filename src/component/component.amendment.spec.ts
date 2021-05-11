import { FeatureContext, FeatureDef } from '../feature';
import { ComponentDef, ComponentDef__symbol } from './component-def';
import { Component } from './component.amendment';

describe('component', () => {
  describe('@Component', () => {
    it('assigns component definition', () => {

      class BaseElement {
      }

      const def: ComponentDef = {
        name: 'test-component',
        extend: {
          name: 'input',
          type: BaseElement,
        },
      };

      @Component(def)
      class TestComponent {
      }

      expect(ComponentDef.of(TestComponent)).toEqual(def);
    });
  });
  it('accepts an amendment as parameter', () => {

    class BaseElement {}

    const def: ComponentDef = {
      name: 'test-component',
      extend: {
        name: 'input',
        type: BaseElement,
      },
    };

    @Component(({ amend }) => {
      amend()().amend({ componentDef: def });
    })
    class TestComponent {}

    expect(ComponentDef.of(TestComponent)).toEqual(def);
  });
  it('declares a feature', async () => {

    const init = jest.fn();
    const def: FeatureDef = { init };

    @Component(({ amend }) => {
      amend({ featureDef: def });
    })
    class TestFeature {}

    const context: FeatureContext = { name: 'feature context' } as unknown as FeatureContext;

    await FeatureDef.of(TestFeature).init?.(context);

    expect(init).toHaveBeenCalledWith(context);
    expect(init.mock.instances[0]).toBe(def);
  });

  describe('ComponentAmendment', () => {
    it('serves as component definition itself', () => {

      class BaseElement {}

      const def: ComponentDef = {
        name: 'test-component',
        extend: {
          name: 'input',
          type: BaseElement,
        },
      };

      @Component<typeof TestComponent>(
          Component({ [ComponentDef__symbol]: () => def }),
      )
      class TestComponent {}

      expect(ComponentDef.of(TestComponent)).toEqual(def);
    });
  });
});
