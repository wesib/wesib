import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { cxConstAsset } from '@proc7ts/context-builder';
import { CxEntry, cxSingle } from '@proc7ts/context-values';
import { noop } from '@proc7ts/primitives';
import { bootstrapComponents } from '../bootstrap-components';
import { ComponentContext } from './component-context';
import { ComponentMember } from './component-member.amendment';
import { ComponentClass, DefinitionContext } from './definition';

describe('component', () => {

  const testEntry: CxEntry<string> = { perContext: cxSingle() };

  let element: Element;

  beforeEach(() => {
    element = document.body.appendChild(document.createElement('test-element'));
  });
  afterEach(() => {
    element.remove();
  });

  describe('@ComponentMember', () => {
    it('accesses property', async () => {

      class TestComponent {

        @ComponentMember(noop)
        property = 'some';

      }

      const { component } = await bootstrap(TestComponent);

      expect(component.property).toBe('some');

      component.property = 'other';
      expect(component.property).toBe('other');
    });
    it('updates property access', async () => {

      class TestComponent {

        @ComponentMember<string, typeof TestComponent>(({ get, set, amend }) => amend({
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

        @ComponentMember(({ amend }) => amend({
          configurable: false,
          enumerable: false,
        }))
        property = 'some';

      }

      const desc = Reflect.getOwnPropertyDescriptor(TestComponent.prototype, 'property');

      expect(desc?.configurable).toBe(false);
      expect(desc?.enumerable).toBe(false);
    });
    it('sets property attributes', () => {

      class TestComponent {

        @ComponentMember(({ amend }) => amend({
          configurable: true,
          enumerable: false,
        }))
        property = 'some';

      }

      const desc = Reflect.getOwnPropertyDescriptor(TestComponent.prototype, 'property');

      expect(desc?.configurable).toBe(true);
      expect(desc?.enumerable).toBe(false);
    });
    it('throws when setting read-only property', async () => {

      class TestComponent {

        @ComponentMember<string, typeof TestComponent>(({ get, set, amend }) => amend({
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

      expect(() => (component as any).property = 'other').toThrow(new TypeError(
          'Property TestComponent.property is not writable',
      ));
    });
    it('throws when reading non-readable property', async () => {

      class TestComponent {

        @ComponentMember<string, typeof TestComponent>(({ get, set, amend }) => amend({
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
      expect(() => (component as any).property).toThrow(new TypeError(
          'Property TestComponent.property is not readable',
      ));
    });
    it('applies component definition', async () => {

      class TestComponent {

        @ComponentMember(({ amend }) => amend({
          componentDef: {
            setup(setup) {
              setup.perComponent(cxConstAsset(testEntry, 'test-value'));
            },
          },
        }))
        property = 'some';

      }

      const context = await bootstrap(TestComponent);

      expect(context.get(testEntry)).toBe('test-value');
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
