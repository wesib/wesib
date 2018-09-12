import { bootstrapComponents } from '../bootstrap';
import { Class } from '../common';
import { Component, ComponentClass, ComponentDef } from '../component';
import { BootstrapContext, WesFeature } from '../feature';
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

  async create(...features: Class[]): Promise<this> {
    await this.iframe.create();

    @WesFeature({
      configure: ctx => this._context = ctx,
      provides: { key: BootstrapContext.windowKey, provider: () => this.window },
    })
    class TestFeature {}

    bootstrapComponents(
        TestFeature,
        ...features,
    );

    return this;
  }

  async addElement<T extends object>(componentType: ComponentClass<T>): Promise<any> {

    const elementType = this._waitForConnect(componentType);
    const elementName = ComponentDef.of(componentType).name;

    this.document.body.appendChild(this.document.createElement(elementName));

    return elementType;
  }

  private async _waitForConnect<T extends object>(componentType: ComponentClass<T>): Promise<any> {

    const result = new Promise<any>(resolve => {
      this.context.onComponent(context => {
        context.onConnect(() => {
          if (Component.of(context.element) instanceof componentType) {
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
