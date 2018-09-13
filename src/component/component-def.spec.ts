import { FeatureDef } from '../feature';
import { ComponentClass } from './component';
import { ComponentDef, PartialComponentDef } from './component-def';
import './component-def.ns';

describe('component/component-def', () => {
  describe('ComponentDef', () => {
    describe('of', () => {
      it('returns component definition', () => {

        class TestComponent {
          static [ComponentDef.symbol]: ComponentDef = {
            name: 'test-component',
          };
        }

        expect(ComponentDef.of(TestComponent)).toEqual(TestComponent[ComponentDef.symbol]);
      });
      it('fails when there is no component definition', () => {

        class TestComponent {
        }

        expect(() => ComponentDef.of(TestComponent)).toThrow(jasmine.any(TypeError));
      });
      it('requests inherited definition', () => {

        class A {
          static [ComponentDef.symbol]: ComponentDef = {
            name: 'test-component',
          };
        }
        class B extends A {}

        expect(ComponentDef.of(B)).toEqual(A[ComponentDef.symbol]);
      });
      it('merges with inherited definition', () => {

        class A {
          static [ComponentDef.symbol]: ComponentDef = {
            name: 'component-a',
            extend: {
              name: 'div',
              type: HTMLDivElement,
            },
          };
        }
        class B extends A {
          static [ComponentDef.symbol]: ComponentDef = {
            name: 'component-b',
            extend: {
              name: 'span',
              type: HTMLSpanElement,
            },
          };
        }

        expect<any>(ComponentDef.of(B))
            .toEqual(ComponentDef.merge(A[ComponentDef.symbol], B[ComponentDef.symbol]));
      });
    });
    describe('merge', () => {
      it('merges name', () => {
        expect(ComponentDef.merge({ name: 'name1' }, { name: 'name2' })).toEqual({ name: 'name2' });
        expect(ComponentDef.merge({ name: 'name1' }, {})).toEqual({ name: 'name1' });
        expect(ComponentDef.merge({}, { name: 'name2' })).toEqual({ name: 'name2' });
      });
      it('merges element extension', () => {
        expect(ComponentDef.merge<HTMLElement>(
            { extend: { name: 'div', type: HTMLDivElement } },
            { extend: { name: 'input', type: HTMLInputElement } }))
            .toEqual({ extend: { name: 'input', type: HTMLInputElement } });
        expect(ComponentDef.merge<HTMLElement>(
            { extend: { name: 'div', type: HTMLDivElement } },
            {}))
            .toEqual({ extend: { name: 'div', type: HTMLDivElement } });
        expect(ComponentDef.merge<HTMLElement>(
            { extend: { name: 'div', type: HTMLDivElement } },
            { extend: { name: 'input', type: HTMLInputElement } }))
            .toEqual({ extend: { name: 'input', type: HTMLInputElement } });
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

        const initialDef: ComponentDef = {
          name: 'test',
        };

        ComponentDef.define(TestComponent, initialDef);

        const def: PartialComponentDef = {
          extend: {
            name: 'span',
            type: HTMLSpanElement,
          },
        };
        const componentType = ComponentDef.define(TestComponent, def);

        expect<PartialComponentDef>(ComponentDef.of(componentType)).toEqual(ComponentDef.merge(initialDef, def));
      });
      describe('created component feature', () => {
        it('registers the component', () => {

          const componentType = ComponentDef.define(TestComponent, { name: 'test-component' });
          const featureDef = FeatureDef.of(componentType)!;

          expect(featureDef).toBeDefined();

          const configure = featureDef.bootstrap!;

          expect(configure).toBeDefined();

          const featureContextSpy = jasmine.createSpyObj('bootstrapContext', ['define']);

          configure.call(componentType, featureContextSpy);

          expect(featureContextSpy.define).toHaveBeenCalledWith(componentType);
        });
        it('does not register the base component', () => {

          const baseType = ComponentDef.define(TestComponent, { name: 'test-component' });

          class ExtComponent extends TestComponent {}

          const extType = ComponentDef.define(ExtComponent, { name: 'ext-component' });
          const featureDef = FeatureDef.of(extType)!;

          expect(featureDef).toBeDefined();

          const configure = featureDef.bootstrap!;

          expect(configure).toBeDefined();

          const featureContextSpy = jasmine.createSpyObj('bootstrapContext', ['define']);

          configure.call(extType, featureContextSpy);

          expect(featureContextSpy.define).toHaveBeenCalledWith(extType);
          expect(featureContextSpy.define).not.toHaveBeenCalledWith(baseType);
        });
        it('registers component only once', () => {

          const componentType = ComponentDef.define(
              ComponentDef.define(
                  TestComponent,
                  {}),
              { name: 'test-component' });
          const featureDef = FeatureDef.of(componentType)!;

          expect(featureDef).toBeDefined();

          const configure = featureDef.bootstrap!;

          expect(configure).toBeDefined();

          const featureContextSpy = jasmine.createSpyObj('bootstrapContext', ['define']);

          configure.call(componentType, featureContextSpy);

          expect(featureContextSpy.define).toHaveBeenCalledWith(componentType);
          expect(featureContextSpy.define).toHaveBeenCalledTimes(1);
        });
      });
    });
  });
});
