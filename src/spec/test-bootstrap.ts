import { ComponentDef, ComponentElementType, ComponentType } from '../component';
import { ElementClass } from '../element';
import { BootstrapContext, FeatureType } from '../feature';
import { bootstrapComponents } from '../feature';
import { TestIframe } from './test-iframe';

export class TestBootstrap {

  readonly iframe = new TestIframe();
  private _context!: BootstrapContext;

  constructor() {
  }

  get context(): BootstrapContext {
    return this._context;
  }

  get window(): Window {
    return this.iframe.window;
  }

  get document(): Document {
    return this.iframe.document;
  }

  async create(): Promise<this> {
    await this.iframe.create();

    class TestFeature {}

    FeatureType.define(TestFeature, { configure: ctx => this._context = ctx });

    bootstrapComponents({ window: this.window }, TestFeature);

    return this;
  }

  async define<T extends object>(
      componentType: ComponentType<T>,
      connected: (element: ComponentElementType<T>) => void = () => {}):
      Promise<ElementClass<ComponentElementType<T>>> {

    this.context.onElement((element, context) => {
      context.onConnect(() => {
        connected(context.element);
      });
    });

    const elementType = this.context.define(componentType);

    await this.context.whenDefined(componentType);

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
