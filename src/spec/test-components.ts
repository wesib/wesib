import { Components } from '../api';
import { ComponentDef, ComponentElementType, ComponentType } from '../component';
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
    this._components = Components.bootstrap({ window: this.window });
    return this;
  }

  async define<T extends object>(
      componentType: ComponentType<T>,
      connected: (element: ComponentElementType<T>) => void = () => {}):
      Promise<ElementClass<ComponentElementType<T>>> {

    this.components.onElement((element, context) => {
      context.onConnect(() => {
        connected(context.element);
      });
    });

    const elementType = this.components.define(componentType);

    await this.components.whenDefined(componentType);

    return elementType;
  }

  async addElement<T extends object>(componentType: ComponentType<T>): Promise<ComponentElementType<T>> {

    const elementType = new Promise<ComponentElementType<T>>(async resolve => {
      await this.define(componentType, resolve);
    });

    const elementName = ComponentDef.of(componentType).name;

    this.document.body.appendChild(this.document.createElement(elementName));

    return elementType;
  }

  dispose() {
    this.iframe.remove();
  }

}
