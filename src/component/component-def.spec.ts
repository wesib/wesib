import { SingleContextKey } from 'context-values';
import { FeatureContext, FeatureDef, FeatureDef__symbol } from '../feature';
import { ComponentDef, ComponentDef__symbol } from './component-def';
import { ComponentClass, DefinitionContext, DefinitionSetup } from './definition';
import Mocked = jest.Mocked;

describe('component', () => {
  describe('ComponentDef', () => {
    describe('of', () => {
      it('returns component definition', () => {

        class TestComponent {
          static [ComponentDef__symbol]: ComponentDef = {
            name: 'test-component',
          };
        }

        expect(ComponentDef.of(TestComponent)).toEqual(TestComponent[ComponentDef__symbol]);
      });
      it('returns empty definition when absent', () => {

        class TestComponent {
        }

        expect(ComponentDef.of(TestComponent)).toEqual({});
      });
      it('requests inherited definition', () => {

        class A {
          static [ComponentDef__symbol]: ComponentDef = {
            name: 'test-component',
          };
        }
        class B extends A {}

        expect(ComponentDef.of(B)).toEqual(A[ComponentDef__symbol]);
      });
      it('merges with inherited definition', () => {

        class BaseA {}
        class BaseB {}
        class A {
          static [ComponentDef__symbol]: ComponentDef = {
            name: 'component-a',
            extend: {
              name: 'div',
              type: BaseA,
            },
          };
        }
        class B extends A {
          static [ComponentDef__symbol]: ComponentDef = {
            name: 'component-b',
            extend: {
              name: 'span',
              type: BaseB,
            },
          };
        }

        expect(ComponentDef.of(B))
            .toEqual(ComponentDef.merge(A[ComponentDef__symbol], B[ComponentDef__symbol]));
      });
    });
    describe('merge', () => {
      it('merges `name`', () => {
        expect(ComponentDef.merge({ name: 'name1' }, { name: 'name2' })).toEqual({ name: 'name2' });
        expect(ComponentDef.merge({ name: 'name1' }, {})).toEqual({ name: 'name1' });
        expect(ComponentDef.merge({}, { name: 'name2' })).toEqual({ name: 'name2' });
        expect(ComponentDef.merge({ name: 'name1' }, { name: undefined })).toEqual({ name: undefined });
      });
      it('merges `extend`', () => {

        class Base1 {}
        class Base2 {}

        expect(ComponentDef.merge(
            { extend: { name: 'div', type: Base1 } },
            { extend: { name: 'input', type: Base2 } }))
            .toEqual({ extend: { name: 'input', type: Base2 } });
        expect(ComponentDef.merge(
            { extend: { name: 'div', type: Base1 } },
            {}))
            .toEqual({ extend: { name: 'div', type: Base1 } });
        expect(ComponentDef.merge(
            { extend: { name: 'div', type: Base1 } },
            { extend: { name: 'input', type: Base2 } }))
            .toEqual({ extend: { name: 'input', type: Base2 } });
      });
      it('merges `setup`', () => {

        const setup1 = jest.fn();
        const setup2 = jest.fn();
        const merged = ComponentDef.merge(
            { setup: setup1 },
            { setup: setup2 },
        ).setup!;
        const setup: DefinitionSetup = { name: 'definition setup' } as any;

        merged(setup);

        expect(setup1).toHaveBeenCalledWith(setup);
        expect(setup2).toHaveBeenCalledWith(setup);
      });
      it('merges `define`', () => {

        const define1 = jest.fn();
        const define2 = jest.fn();
        const merged = ComponentDef.merge(
            { define: define1 },
            { define: define2 },
        ).define!;
        const context: DefinitionContext = { name: 'definition context' } as any;

        class Component {}

        merged.call(Component, context);

        expect(define1).toHaveBeenCalledWith(context);
        expect(define1.mock.instances[0]).toBe(Component);
        expect(define2).toHaveBeenCalledWith(context);
        expect(define2.mock.instances[0]).toBe(Component);
      });
      it('merges `feature`', () => {

        const setup1 = jest.fn();
        const setup2 = jest.fn();
        const mergedFeature = ComponentDef.merge(
            { feature: { setup: setup1 } },
            { feature: { setup: setup2 } },
        ).feature;

        class TestFeature {}
        const setup = { name: 'setup' } as any;

        mergedFeature?.setup?.call(TestFeature, setup);

        expect(setup1).toHaveBeenCalledWith(setup);
        expect(setup2).toHaveBeenCalledWith(setup);
      });
      it('does not merge empty definitions', () => {
        expect(ComponentDef.merge({}, {})).toEqual({});
      });
    });
    describe('define', () => {

      let TestComponent: ComponentClass;

      beforeEach(() => {
        TestComponent = class {};
      });

      it('assigns component definition', () => {

        const def: ComponentDef = { name: 'test-component' };
        const componentType = ComponentDef.define(TestComponent, def);

        expect(ComponentDef.of(componentType)).toEqual(def);
      });
      it('updates component definition', () => {

        class Base {}

        const initialDef: ComponentDef = {
          name: 'test',
        };

        ComponentDef.define(TestComponent, initialDef);

        const def: ComponentDef = {
          extend: {
            name: 'span',
            type: Base,
          },
        };
        const componentType = ComponentDef.define(TestComponent, def);

        expect<ComponentDef>(ComponentDef.of(componentType)).toEqual(ComponentDef.merge(initialDef, def));
      });
      it('accepts provided component definition', () => {

        const def: ComponentDef = { name: 'test-component' };
        const componentType = ComponentDef.define(TestComponent, { [ComponentDef__symbol]: def });

        expect(ComponentDef.of(componentType)).toEqual(def);
      });
      it('accepts built component definition', () => {

        const def: ComponentDef = { name: 'test-component' };
        const mockBuildDef = jest.fn(() => def);
        const componentType = ComponentDef.define(TestComponent, { [ComponentDef__symbol]: mockBuildDef });

        expect(mockBuildDef).toHaveBeenCalledWith(TestComponent);
        expect(ComponentDef.of(componentType)).toEqual(def);
      });
      it('accepts provided feature definition', () => {

        class Dep {}

        const def: FeatureDef = { needs: Dep };
        const componentType = ComponentDef.define(TestComponent, { [FeatureDef__symbol]: def });

        expect(ComponentDef.of(componentType)).toEqual({ feature: def });
      });
      it('accepts built feature definition', () => {

        class Dep {}

        const def: FeatureDef = { needs: Dep };
        const mockBuildDef = jest.fn(() => def);
        const componentType = ComponentDef.define(TestComponent, { [FeatureDef__symbol]: mockBuildDef });

        expect(mockBuildDef).toHaveBeenCalledWith(TestComponent);
        expect(ComponentDef.of(componentType)).toEqual({ feature: def });
      });

      describe('created component feature', () => {
        it('applies feature options', () => {

          const key1 = new SingleContextKey<string>('a');
          const key2 = new SingleContextKey<string>('b');
          const feature: FeatureDef = {
            setup(setup) {
              setup.provide({ a: key1, is: 'a' });
              setup.provide({ a: key2, is: 'b' });
            },
          };
          const def: ComponentDef = { name: 'test-component', feature };
          const componentType = ComponentDef.define(TestComponent, def);

          expect(ComponentDef.of(componentType)).toEqual(def);

          const featureDef = FeatureDef.of(componentType)!;

          expect(featureDef).toBeDefined();
          expect(featureDef).toMatchObject(feature);
        });
        it('registers the component', () => {

          const componentType = ComponentDef.define(TestComponent, { name: 'test-component' });
          const featureDef = FeatureDef.of(componentType);

          expect(featureDef.init!).toBeDefined();

          const mockFeatureContext: Mocked<FeatureContext> = {
            feature: componentType,
            define: jest.fn(),
          } as any;

          featureDef.init?.(mockFeatureContext);

          expect(mockFeatureContext.define).toHaveBeenCalledWith(componentType);
        });
        it('does not register the base component', () => {

          const baseType = ComponentDef.define(TestComponent, { name: 'test-component' });

          class ExtComponent extends TestComponent {}

          const extType = ComponentDef.define(ExtComponent, { name: 'ext-component' });
          const featureDef = FeatureDef.of(extType);

          expect(featureDef.init).toBeDefined();

          const mockFeatureContext: Mocked<FeatureContext> = {
            feature: extType,
            define: jest.fn(),
          } as any;

          featureDef.init?.(mockFeatureContext);

          expect(mockFeatureContext.define).toHaveBeenCalledWith(extType);
          expect(mockFeatureContext.define).not.toHaveBeenCalledWith(baseType);
        });
        it('registers component only once', () => {

          const componentType = ComponentDef.define(
              ComponentDef.define(
                  TestComponent,
                  {},
              ),
              { name: 'test-component' },
          );
          const featureDef = FeatureDef.of(componentType);

          expect(featureDef.init).toBeDefined();

          const mockFeatureContext: Mocked<FeatureContext> = {
            feature: componentType,
            define: jest.fn(),
          } as any;

          featureDef.init?.call(componentType, mockFeatureContext);

          expect(mockFeatureContext.define).toHaveBeenCalledWith(componentType);
          expect(mockFeatureContext.define).toHaveBeenCalledTimes(1);
        });
      });
    });
  });
});
