import { noop } from 'call-thru';
import { SingleContextKey } from 'context-values';
import { FnContextKey } from 'context-values/updatable';
import { BootstrapContext } from '../boot';
import { bootstrapComponents } from '../boot/bootstrap';
import { ComponentContext } from './component-context';
import { ComponentProperty } from './component-property.decorator';
import { Component } from './component.decorator';
import { ComponentClass } from './definition';

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

        @ComponentProperty(({ access }: ComponentProperty.Descriptor<string, typeof TestComponent>) => ({
          access(context) {

            const accessor = access(context);

            return {
              get() {
                return accessor.get() + `!`;
              },
              set(value) {
                accessor.set('+' + value);
              },
            };
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

        @ComponentProperty(({ access }: ComponentProperty.Descriptor<string, typeof TestComponent>) => ({
          access(context) {

            const accessor = access(context);

            return {
              get() {
                return accessor.get() + `!`;
              },
              set(value) {
                accessor.set('+' + value);
              },
            };
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

        @ComponentProperty(({ access }: ComponentProperty.Descriptor<string, typeof TestComponent>) => ({
          access(context) {

            const accessor = access(context);

            return {
              get() {
                return accessor.get() + `!`;
              },
              set(value) {
                accessor.set('+' + value);
              },
            };
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
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            ComponentProperty<string, typeof TestComponent>(({ access }) => ({
              componentDef: {
                setup(setup) {
                  setup.perComponent({
                    a: testKey,
                    by: (ctx: ComponentContext<TestComponent>) => access(ctx.component).get(),
                  });
                },
              },
            })).With(component => ({
              get: () => component.property,
              set: value => component.property = value,
            })),
        )
        class TestComponent {

          property = 'some';

        }

        const context = await bootstrap(TestComponent);

        expect(context.get(testKey)).toBe('some');
      });
      it('handles empty definition', async () => {

        @Component(
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            ComponentProperty<string, typeof TestComponent>(noop).With(component => ({
              get: () => component.property,
              set: value => component.property = value,
            })),
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
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            ComponentProperty<string, typeof TestComponent>(({ access }) => ({
              componentDef: {
                setup(setup) {
                  setup.perComponent({
                    a: testKey,
                    by: (ctx: ComponentContext<TestComponent>) => access(ctx).get(),
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
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            ComponentProperty<string, typeof TestComponent>(({ access }) => ({
              componentDef: {
                setup(setup) {
                  setup.perComponent({
                    a: testFnKey,
                    by: (ctx: ComponentContext<TestComponent>) => (value: string) => access(ctx).set(value),
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
  });

  async function bootstrap<T extends object>(type: ComponentClass<T>): Promise<ComponentContext<T>> {

    const bsContext = await new Promise<BootstrapContext>(
        bootstrapComponents(type).whenReady,
    );
    const factory = await bsContext.whenDefined(type);

    return factory.mountTo(element).context;
  }
});
