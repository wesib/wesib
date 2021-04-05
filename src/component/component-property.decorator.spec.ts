import { SingleContextKey } from '@proc7ts/context-values';
import { FnContextKey } from '@proc7ts/context-values/updatable';
import { noop } from '@proc7ts/primitives';
import { bootstrapComponents } from '../boot/bootstrap';
import { ComponentContext } from './component-context';
import { AnonymousComponentProperty__symbol, ComponentProperty } from './component-property.decorator';
import { Component } from './component.decorator';
import { ComponentClass, DefinitionContext } from './definition';

describe('component', () => {

  const testKey = new SingleContextKey<string>('test-key');
  const testFnKey = new FnContextKey<[string]>('test-fn-key');

  let element: Element;

  beforeEach(() => {
    element = document.body.appendChild(document.createElement('test-element'));
  });
  afterEach(() => {
    element.remove();
  });

  describe('@ComponentProperty', () => {
    it('accesses property', async () => {

      class TestComponent {

        @ComponentProperty(noop)
        property = 'some';

      }

      const { component } = await bootstrap(TestComponent);

      expect(component.property).toBe('some');

      component.property = 'other';
      expect(component.property).toBe('other');
    });
    it('updates property access', async () => {

      class TestComponent {

        @ComponentProperty(({ get, set }: ComponentProperty.Descriptor<string, typeof TestComponent>) => ({
          get(component) {
            return get(component) + `!`;
          },
          set(component, value) {
            set(component, '+' + value);
          },
        }))
        property = 'some';

      }

      const { component } = await bootstrap(TestComponent);

      expect(component.property).toBe('+some!');

      component.property = 'other';
      expect(component.property).toBe('+other!');
    });
    it('removes property attributes', () => {

      class TestComponent {

        @ComponentProperty(() => ({
          configurable: false,
          enumerable: false,
        }))
        property = 'some';

      }

      const desc = Object.getOwnPropertyDescriptor(TestComponent.prototype, 'property');

      expect(desc?.configurable).toBe(false);
      expect(desc?.enumerable).toBe(false);
    });
    it('sets property attributes', () => {

      class TestComponent {

        @ComponentProperty(() => ({
          configurable: true,
          enumerable: true,
        }))
        property = 'some';

      }

      const desc = Object.getOwnPropertyDescriptor(TestComponent.prototype, 'property');

      expect(desc?.configurable).toBe(true);
      expect(desc?.enumerable).toBe(true);
    });
    it('throws when setting read-only property', async () => {

      class TestComponent {

        @ComponentProperty(({ get, set }: ComponentProperty.Descriptor<string, typeof TestComponent>) => ({
          get(component) {
            return get(component) + `!`;
          },
          set(component, value) {
            set(component, '+' + value);
          },
        }))
        get property(): string {
          return 'some';
        }

      }

      const { component } = await bootstrap(TestComponent);

      expect(component.property).toBe('some!');

      expect(() => (component as any).property = 'other').toThrow(TypeError);
    });
    it('throws when reading non-readable property', async () => {

      class TestComponent {

        @ComponentProperty(({ get, set }: ComponentProperty.Descriptor<string, typeof TestComponent>) => ({
          get(component) {
            return get(component) + `!`;
          },
          set(component, value) {
            set(component, '+' + value);
          },
        }))
        set property(_value: string) {
          /* noop */
        }

      }

      const { component } = await bootstrap(TestComponent);
      expect(() => (component as any).property).toThrow(TypeError);
    });
    it('applies component definition', async () => {

      class TestComponent {

        @ComponentProperty(() => ({
          componentDef: {
            setup(setup) {
              setup.perComponent({ a: testKey, is: 'test-value' });
            },
          },
        }))
        property = 'some';

      }

      const context = await bootstrap(TestComponent);

      expect(context.get(testKey)).toBe('test-value');
    });

    describe('With', () => {
      it('provides property accessor', async () => {

        @Component(
            ComponentProperty<string, typeof TestComponent>(({ get }) => ({
              componentDef: {
                setup(setup) {
                  setup.perComponent({
                    a: testKey,
                    by: ({ component }: ComponentContext<TestComponent>) => get(component),
                  });
                },
              },
            })).With({
              get: component => component.property,
              set: (component, value) => component.property = value,
            }),
        )
        class TestComponent {

          property = 'some';

        }

        const context = await bootstrap(TestComponent);

        expect(context.get(testKey)).toBe('some');
      });
      it('handles empty definition', async () => {

        @Component(
            ComponentProperty<string, typeof TestComponent>(noop).With({
              get: component => component.property,
              set: (component, value) => component.property = value,
            }),
        )
        class TestComponent {

          property = 'some';

        }

        const context = await bootstrap(TestComponent);

        expect(context.get(testKey, { or: null })).toBeNull();
      });
    });
    describe('As', () => {
      it('provides constant value', async () => {

        @Component(
            ComponentProperty<string, typeof TestComponent>(({ get }) => ({
              componentDef: {
                setup(setup) {
                  setup.perComponent({
                    a: testKey,
                    by: ({ component }: ComponentContext<TestComponent>) => get(component),
                  });
                },
              },
            })).As('constant'),
        )
        class TestComponent {
        }

        const context = await bootstrap(TestComponent);

        expect(context.get(testKey)).toBe('constant');
      });
      it('throws on attempt to set property value', async () => {

        @Component(
            ComponentProperty<string, typeof TestComponent>(({ set }) => ({
              componentDef: {
                setup(setup) {
                  setup.perComponent({
                    a: testFnKey,
                    by: ({ component }: ComponentContext<TestComponent>) => (value: string) => set(component, value),
                  });
                },
              },
            })).As('constant'),
        )
        class TestComponent {
        }

        const context = await bootstrap(TestComponent);

        expect(() => context.get(testFnKey)('new value')).toThrow(TypeError);
      });
    });
    describe('Bind', () => {
      it('binds accessors to each components', async () => {

        const binder: ComponentProperty.Binder<string> = (component: any, key) => {

          const accessor: ComponentProperty.BoundAccessor<string> = {
            get: () => component[key],
            set: value => component[key] = value,
          };

          return component.accessor = accessor;
        };

        @Component(
            ComponentProperty<string, typeof TestComponent>(({ get, set }) => ({
              componentDef: {
                define(defContext) {
                  defContext.whenComponent(context => {
                    context.whenReady(({ component }) => {
                      expect(get(component)).toBe('default'); // Ensure accessor initiated
                      set(component, 'init');
                    });
                  });
                },
              },
            })).Bind(binder, 'property'),
        )
        class TestComponent {

          property = 'default';
          accessor!: ComponentProperty.BoundAccessor<string>;

        }

        const defContext = await bootstrapDefinition(TestComponent);
        const component1 = defContext.mountTo(element).component;
        const component2 = defContext.mountTo(document.createElement('other-component')).component;

        expect(component1.property).toBe('init');
        expect(component2.property).toBe('init');
        expect(component1.accessor.get!()).toBe('init');
        expect(component2.accessor.get!()).toBe('init');

        component1.property = 'other';
        expect(component1.property).toBe('other');
        expect(component2.property).toBe('init');
        expect(component1.accessor.get!()).toBe('other');
        expect(component2.accessor.get!()).toBe('init');

        component2.accessor.set!('third');
        expect(component1.property).toBe('other');
        expect(component2.property).toBe('third');
        expect(component1.accessor.get!()).toBe('other');
        expect(component2.accessor.get!()).toBe('third');
      });
      it('binds anonymous property accessor by default', async () => {

        const binder: ComponentProperty.Binder<string> = (component: any, key) => {

          const accessor: ComponentProperty.BoundAccessor<string> = {
            get: () => component[key],
            set: value => component[key] = value,
          };

          return component.accessor = accessor;
        };

        @Component(
            ComponentProperty<string, typeof TestComponent>(({ get, set }) => ({
              componentDef: {
                define(defContext) {
                  defContext.whenComponent(context => {
                    context.whenReady(({ component }) => {
                      expect(get(component)).toBe('default'); // Ensure accessor initiated
                      set(component, 'init');
                    });
                  });
                },
              },
            })).Bind(binder),
        )
        class TestComponent {

          accessor!: ComponentProperty.BoundAccessor<string>;
          [AnonymousComponentProperty__symbol] = 'default';

        }

        const { component } = await bootstrap(TestComponent);

        expect(component[AnonymousComponentProperty__symbol]).toBe('init');
        expect(component.accessor.get!()).toBe('init');

        component[AnonymousComponentProperty__symbol] = 'other';
        expect(component.accessor.get!()).toBe('other');

        component.accessor.set!('third');
        expect(component[AnonymousComponentProperty__symbol]).toBe('third');
      });
      it('throws on attempt to assign property value by non-writable accessor', async () => {

        const binder: ComponentProperty.Binder<string> = (component: any, key) => {

          const accessor: ComponentProperty.BoundAccessor<string> = {
            set: value => component[key] = value,
          };

          return component.accessor = accessor;
        };

        @Component(
            ComponentProperty<string, typeof TestComponent>(({ set }) => ({
              componentDef: {
                define(defContext) {
                  defContext.whenComponent(context => {
                    context.whenReady(({ component }) => {
                      set(component, 'init'); // Ensure accessor initiated
                    });
                  });
                },
              },
            })).Bind(binder, 'property'),
        )
        class TestComponent {

          property = 'default';
          accessor!: ComponentProperty.BoundAccessor<string>;

        }

        const { component } = await bootstrap(TestComponent);

        expect(component.property).toBe('init');
        expect(() => component.accessor.get!()).toThrow(TypeError);
      });
    });
    it('throws on attempt to read property value by non-readable accessor', async () => {

      const binder: ComponentProperty.Binder<string> = (component: any, key) => {

        const accessor: ComponentProperty.BoundAccessor<string> = {
          get: () => component[key],
        };

        return component.accessor = accessor;
      };

      @Component(
          ComponentProperty<string, typeof TestComponent>(({ get }) => ({
            componentDef: {
              define(defContext) {
                defContext.whenComponent(context => {
                  context.whenReady(({ component }) => {
                    expect(get(component)).toBe('init'); // Ensure accessor initiated
                  });
                });
              },
            },
          })).Bind(binder, 'property'),
      )
      class TestComponent {

        property = 'init';
        accessor!: ComponentProperty.BoundAccessor<string>;

      }

      const { component } = await bootstrap(TestComponent);

      expect(component.property).toBe('init');
      expect(() => component.accessor.set!('other')).toThrow(TypeError);
    });
  });

  async function bootstrapDefinition<T extends object>(type: ComponentClass<T>): Promise<DefinitionContext<T>> {

    const bsContext = await bootstrapComponents(type).whenReady;

    return await bsContext.whenDefined(type);
  }

  async function bootstrap<T extends object>(type: ComponentClass<T>): Promise<ComponentContext<T>> {

    const defContext = await bootstrapDefinition(type);

    return defContext.mountTo(element);
  }
});
