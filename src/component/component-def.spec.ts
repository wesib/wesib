import { noop } from 'call-thru';
import { SingleContextKey } from 'context-values';
import { FeatureDef } from '../feature';
import { BootstrapContext } from '../kit';
import { ObjectMock } from '../spec/mocks';
import { ComponentClass } from './component-class';
import { ComponentDef, ComponentDef__symbol } from './component-def';
import { DefinitionContext } from './definition';

describe('component/component-def', () => {
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

        expect<any>(ComponentDef.of(B))
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
      it('merges `set`', () => {

        const key1 = new SingleContextKey<string>('a');
        const key2 = new SingleContextKey<string>('b');

        expect(ComponentDef.merge(
            { set: { a: key1, is: 'a' } },
            { set: { a: key2, is: 'b' } })
        ).toEqual({
          set: [
            { a: key1, is: 'a' },
            { a: key2, is: 'b' },
          ]
        });
      });
      it('merges `define`', () => {

        const define1spy = jest.fn();
        const define2spy = jest.fn();
        const merged = ComponentDef.merge(
            { define: define1spy },
            { define: define2spy }).define || noop;
        const context: DefinitionContext<any> = { name: 'definition context' } as any;

        class Component {}

        merged.call(Component, context);

        expect(define1spy).toHaveBeenCalledWith(context);
        expect(define1spy.mock.instances[0]).toBe(Component);
        expect(define2spy).toHaveBeenCalledWith(context);
        expect(define2spy.mock.instances[0]).toBe(Component);
      });
      it('merges `perComponent`', () => {

        const key1 = new SingleContextKey<string>('a');
        const key2 = new SingleContextKey<string>('b');

        expect(ComponentDef.merge(
            { perComponent: { a: key1, is: 'a' } },
            { perComponent: { a: key2, is: 'b' } })
        ).toEqual({
          perComponent: [
            { a: key1, is: 'a' },
            { a: key2, is: 'b' },
          ]
        });
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
      describe('created component feature', () => {
        it('registers the component', () => {

          const componentType = ComponentDef.define(TestComponent, { name: 'test-component' });
          const featureDef = FeatureDef.of(componentType)!;

          expect(featureDef).toBeDefined();

          const init = featureDef.init!;

          expect(init).toBeDefined();

          const bootstrapContextSpy: ObjectMock<BootstrapContext> = {
            define: jest.fn(),
          } as any;

          init.call(componentType, bootstrapContextSpy);

          expect(bootstrapContextSpy.define).toHaveBeenCalledWith(componentType);
        });
        it('does not register the base component', () => {

          const baseType = ComponentDef.define(TestComponent, { name: 'test-component' });

          class ExtComponent extends TestComponent {}

          const extType = ComponentDef.define(ExtComponent, { name: 'ext-component' });
          const featureDef = FeatureDef.of(extType)!;

          expect(featureDef).toBeDefined();

          const init = featureDef.init!;

          expect(init).toBeDefined();

          const bootstrapContextSpy: ObjectMock<BootstrapContext> = {
            define: jest.fn(),
          } as any;

          init.call(extType, bootstrapContextSpy);

          expect(bootstrapContextSpy.define).toHaveBeenCalledWith(extType);
          expect(bootstrapContextSpy.define).not.toHaveBeenCalledWith(baseType);
        });
        it('registers component only once', () => {

          const componentType = ComponentDef.define(
              ComponentDef.define(
                  TestComponent,
                  {}),
              { name: 'test-component' });
          const featureDef = FeatureDef.of(componentType)!;

          expect(featureDef).toBeDefined();

          const init = featureDef.init!;

          expect(init).toBeDefined();

          const bootstrapContextSpy: ObjectMock<BootstrapContext> = {
            define: jest.fn(),
          } as any;

          init.call(componentType, bootstrapContextSpy);

          expect(bootstrapContextSpy.define).toHaveBeenCalledWith(componentType);
          expect(bootstrapContextSpy.define).toHaveBeenCalledTimes(1);
        });
      });
    });
  });
});
