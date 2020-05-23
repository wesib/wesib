import { OnEvent } from '@proc7ts/fun-events';
import { bootstrapComponents } from '../boot/bootstrap';
import { Class } from '../common';
import { ComponentClass, CustomElements, DefinitionContext } from '../component/definition';
import { Feature } from '../feature';

export function testDefinition<T extends object>(componentType: Class<T>): OnEvent<[DefinitionContext<T>]> {

  const customElements: CustomElements = {

    define(): void {/* do not register element */},

    whenDefined(): Promise<void> {
      return Promise.resolve();
    },

  };

  @Feature({
    needs: componentType,
    setup(setup) {
      setup.provide({ a: CustomElements, is: customElements });
    },
  })
  class TestFeature {}

  return bootstrapComponents(TestFeature).whenDefined(componentType);
}

export async function testElement(componentType: ComponentClass): Promise<Class> {

  let result!: Class;

  const customElements: CustomElements = {

    define(_compType: ComponentClass, elementType: Class): void {
      result = elementType;
    },

    whenDefined(): Promise<void> {
      return Promise.resolve();
    },

  };

  @Feature({
    needs: componentType,
    setup(setup) {
      setup.provide({ a: CustomElements, is: customElements });
    },
  })
  class TestFeature {}

  await bootstrapComponents(TestFeature).whenDefined(componentType);

  return result;
}

export class MockElement {

  readonly dispatchEvent = jest.fn();
  readonly addEventListener = jest.fn();
  readonly removeEventListener = jest.fn();
  private readonly _target: any;
  private readonly _attributes: { [name: string]: string | null } = {};

  constructor() {
    this._target = new.target;
  }

  getAttribute(name: string): string | null {

    const value = this._attributes[name];

    return value != null ? value : null;
  }

  setAttribute(name: string, value: string): void {

    const oldValue = this.getAttribute(name);

    this._attributes[name] = value;

    const observedAttributes = this._target.observedAttributes as string[];

    if (observedAttributes && observedAttributes.includes(name)) {
      this.attributeChangedCallback(name, oldValue, value);
    }
  }

  attributeChangedCallback(_name: string, _oldValue: string | null, _newValue: string): void {
    /* no callback */
  }

}
