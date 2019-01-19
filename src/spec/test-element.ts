import { Class } from '../common';
import { ComponentClass } from '../component';
import { ComponentFactory, CustomElements } from '../component/definition';
import { Feature } from '../feature';
import { bootstrapComponents } from '../kit/bootstrap';

export function testComponentFactory<T extends object>(componentType: Class<T>): Promise<ComponentFactory<T>> {

  let result!: Class;

  const customElements: CustomElements = {

    define(compType: ComponentClass<any>, elementType: Class<any>): void {
      result = elementType;
    },

    whenDefined(): Promise<void> {
      return Promise.resolve();
    }

  };

  @Feature({
    need: componentType,
    set: { a: CustomElements, is: customElements },
  })
  class TestFeature {}

  const kit = bootstrapComponents(TestFeature);

  return kit.whenDefined(componentType);
}

export function testElement(componentType: Class<any>): Class<any> {

  let result!: Class;

  const customElements: CustomElements = {

    define(compType: ComponentClass<any>, elementType: Class<any>): void {
      result = elementType;
    },

    whenDefined(): Promise<void> {
      return Promise.resolve();
    }

  };

  @Feature({
    need: componentType,
    set: { a: CustomElements, is: customElements },
  })
  class TestFeature {}

  bootstrapComponents(TestFeature);

  return result;
}

export class MockElement {

  readonly dispatchEvent = jest.fn();
  private _target: any;
  private _attributes: { [name: string]: string | null } = {};

  constructor() {
    this._target = new.target;
  }

  getAttribute(name: string) {

    const value = this._attributes[name];

    return value != null ? value : null;
  }

  setAttribute(name: string, value: string) {

    const oldValue = this.getAttribute(name);

    this._attributes[name] = value;

    const observedAttributes: string[] = this._target.observedAttributes;

    if (observedAttributes && observedAttributes.indexOf(name) >= 0) {
      this.attributeChangedCallback(name, oldValue, value);
    }
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string) {
  }

}
