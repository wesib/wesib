import { NamespaceDef, QualifiedName } from '@frontmeans/namespace-aliaser';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { BootstrapSetup } from '../boot';
import { FeatureContext, FeatureDef } from '../feature';
import { ComponentDef, ComponentDef__symbol } from './component-def';
import { ComponentClass, DefinitionContext, DefinitionSetup } from './definition';

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
        class TestComponent {}

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

          static override [ComponentDef__symbol]: ComponentDef = {
            name: 'component-b',
            extend: {
              name: 'span',
              type: BaseB,
            },
          };

}

        expect(ComponentDef.of(B)).toEqual(
          ComponentDef.merge(A[ComponentDef__symbol], B[ComponentDef__symbol]),
        );
      });
    });

    describe('merge', () => {
      it('merges `name`', () => {
        expect(ComponentDef.merge({ name: 'name1' }, { name: 'name2' })).toEqual({ name: 'name2' });
        expect(ComponentDef.merge({ name: 'name1' }, {})).toEqual({ name: 'name1' });
        expect(ComponentDef.merge({}, { name: 'name2' })).toEqual({ name: 'name2' });
        expect(ComponentDef.merge({ name: 'name1' }, { name: undefined })).toEqual({
          name: undefined,
        });
      });
      it('merges `extend`', () => {
        class Base1 {}

        class Base2 {}

        expect(
          ComponentDef.merge(
            { extend: { name: 'div', type: Base1 } },
            { extend: { name: 'input', type: Base2 } },
          ),
        ).toEqual({ extend: { name: 'input', type: Base2 } });
        expect(ComponentDef.merge({ extend: { name: 'div', type: Base1 } }, {})).toEqual({
          extend: { name: 'div', type: Base1 },
        });
        expect(
          ComponentDef.merge(
            { extend: { name: 'div', type: Base1 } },
            { extend: { name: 'input', type: Base2 } },
          ),
        ).toEqual({ extend: { name: 'input', type: Base2 } });
      });
      it('merges `setup`', () => {
        const setup1 = jest.fn();
        const setup2 = jest.fn();
        const merged = ComponentDef.merge({ setup: setup1 }, { setup: setup2 }).setup!;
        const setup = {
          name: 'definition setup',
        } as Partial<DefinitionSetup<object>> as DefinitionSetup<object>;

        merged(setup);

        expect(setup1).toHaveBeenCalledWith(setup);
        expect(setup2).toHaveBeenCalledWith(setup);
      });
      it('merges `define`', () => {
        const define1 = jest.fn();
        const define2 = jest.fn();
        const merged = ComponentDef.merge({ define: define1 }, { define: define2 }).define!;
        const context = {
          name: 'definition context',
        } as Partial<DefinitionContext<object>> as DefinitionContext<object>;

        class Component {}

        merged.call(Component, context);

        expect(define1).toHaveBeenCalledWith(context);
        expect(define1.mock.instances[0]).toBe(Component);
        expect(define2).toHaveBeenCalledWith(context);
        expect(define2.mock.instances[0]).toBe(Component);
      });
      it('merges `feature`', async () => {
        const setup1 = jest.fn<(context: FeatureContext) => void>();
        const setup2 = jest.fn<(context: FeatureContext) => void>();
        const mergedFeature = ComponentDef.merge(
          { feature: { setup: setup1 } },
          { feature: { setup: setup2 } },
        ).feature;

        class TestFeature {}

        const setup = { name: 'setup' } as Partial<BootstrapSetup> as BootstrapSetup;

        await mergedFeature?.setup?.call(TestFeature, setup);

        expect(setup1).toHaveBeenCalledWith(setup);
        expect(setup2).toHaveBeenCalledWith(setup);
      });
      it('retains `feature` when another one is absent', () => {
        const setup1 = jest.fn<(context: FeatureContext) => void>();
        const feature1: FeatureDef = { setup: setup1 };

        expect(ComponentDef.merge({ feature: feature1 }, {})).toEqual({ feature: feature1 });
        expect(ComponentDef.merge({}, { feature: feature1 })).toEqual({ feature: feature1 });
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
      it('accepts raw component name', () => {
        const name = 'test-component';
        const componentType = ComponentDef.define(TestComponent, name);

        expect(ComponentDef.of(componentType)).toEqual({ name });
      });
      it('accepts qualified component name', () => {
        const name: QualifiedName = [
          'component',
          new NamespaceDef('http://localhost/ns/test', 'test'),
        ];
        const componentType = ComponentDef.define(TestComponent, name);

        expect(ComponentDef.of(componentType)).toEqual({ name });
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

        expect<ComponentDef>(ComponentDef.of(componentType)).toEqual(
          ComponentDef.merge(initialDef, def),
        );
      });
    });
  });
});
