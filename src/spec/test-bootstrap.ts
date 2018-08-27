import { bootstrapComponents } from '../bootstrap';
import { Component, ComponentDef, ComponentElementType, ComponentType } from '../component';
import { WebFeature } from '../decorators';
import { BootstrapContext, FeatureType } from '../feature';
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

  async create(...features: FeatureType[]): Promise<this> {
    await this.iframe.create();

    @WebFeature({
      configure: ctx => this._context = ctx,
    })
    class TestFeature {}

    bootstrapComponents({ window: this.window }, TestFeature, ...features);

    return this;
  }

  async addElement<T extends object>(componentType: ComponentType<T>): Promise<ComponentElementType<T>> {

    const elementType = this._waitForConnect(componentType);
    const elementName = ComponentDef.of(componentType).name;

    this.document.body.appendChild(this.document.createElement(elementName));

    return elementType;
  }

  private async _waitForConnect<T extends object>(componentType: ComponentType<T>): Promise<ComponentElementType<T>> {

    const result = new Promise<ComponentElementType<T>>(resolve => {
      this.context.onElement((element, context) => {
        context.onConnect(() => {
          if (Component.of(element) instanceof componentType) {
            resolve(context.element);
          }
        });
      });
    });

    await this.context.whenDefined(componentType);

    return result;
  }

  dispose() {
    this.iframe.remove();
  }

}
