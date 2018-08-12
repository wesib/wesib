import { ComponentElementType, ComponentType, defineComponent, definitionOf } from '../component';
import { ElementClass } from '../element';
import { ComponentRegistry } from '../element/component-registry';
import { ElementBuilder } from '../element/element-builder';
import { TestIframe } from './test-iframe';

export class TestComponentRegistry {

  readonly iframe = new TestIframe();
  private readonly _builder?: ElementBuilder;
  private _registry!: ComponentRegistry;

  constructor({ builder }: { builder?: ElementBuilder } = {}) {
    this._builder = builder;
  }

  get registry(): ComponentRegistry {
    return this._registry;
  }

  get builder(): ElementBuilder {
    return this.registry.builder;
  }

  get window(): Window {
    return this.iframe.window;
  }

  get document(): Document {
    return this.iframe.document;
  }

  async create(): Promise<this> {
    await this.iframe.create();
    this._registry = new ComponentRegistry({ window: this.window, builder: this._builder });
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

    const elementType = this.registry.define(componentType);

    await this.registry.whenDefined(componentType);

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
