import { Components, createComponents } from '../api';
import { ComponentElementType, ComponentType, defineComponent, definitionOf } from '../component';
import { ElementClass } from '../element';
import { TestIframe } from './test-iframe';

export class TestComponents {

  readonly iframe = new TestIframe();
  private _components!: Components;

  constructor() {
  }

  get components(): Components {
    return this._components;
  }

  get window(): Window {
    return this.iframe.window;
  }

  get document(): Document {
    return this.iframe.document;
  }

  async create(): Promise<this> {
    await this.iframe.create();
    this._components = createComponents({ window: this.window });
    return this;
  }

  async define<T extends object>(
      componentType: ComponentType<T>,
      connected: (element: ComponentElementType<T>) => void = () => {}):
      Promise<ElementClass<ComponentElementType<T>>> {

    defineComponent(componentType, {
      properties: {
        connectedCallback: {
          value: function(this: ComponentElementType<T>) {
            connected(this);
          }
        }
      }
    });

    const elementType = this.components.define(componentType);

    await this.components.whenDefined(componentType);

    return elementType;
  }

  async addElement<T extends object>(componentType: ComponentType<T>): Promise<ComponentElementType<T>> {

    const elementType = new Promise<ComponentElementType<T>>(async resolve => {
      await this.define(componentType, resolve);
    });

    const elementName = definitionOf(componentType).name;

    this.document.body.appendChild(this.document.createElement(elementName));

    return elementType;
  }

  dispose() {
    this.iframe.remove();
  }

}
