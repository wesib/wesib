import { ComponentClass } from '../../component';
import { ComponentFactory, CustomElements } from '../../component/definition';
import { BootstrapContext } from '../bootstrap-context';
import { ComponentFactory__symbol, componentFactoryOf } from './component-factory.symbol.impl';
import { ElementBuilder } from './element-builder.impl';

/**
 * @internal
 */
export class ComponentRegistry {

  readonly bootstrapContext: BootstrapContext;
  readonly elementBuilder: ElementBuilder;
  private _definitionQueue: (() => void)[] = [];

  static create(opts: {
    bootstrapContext: BootstrapContext;
    elementBuilder: ElementBuilder;
  }): ComponentRegistry {
    return new ComponentRegistry(opts);
  }

  private constructor(
      {
        bootstrapContext,
        elementBuilder,
      }: {
        bootstrapContext: BootstrapContext;
        elementBuilder: ElementBuilder;
      }) {
    this.bootstrapContext = bootstrapContext;
    this.elementBuilder = elementBuilder;
  }

  get customElements(): CustomElements {
    return this.bootstrapContext.get(CustomElements);
  }

  define<T extends object>(componentType: ComponentClass<T>) {
    this._definitionQueue.push(() => {

      const factory = this.elementBuilder.buildElement(componentType);
      (componentType as any)[ComponentFactory__symbol] = factory;

      this.customElements.define(componentType, factory.elementType);
    });
  }

  complete() {
    this._definitionQueue.forEach(definition => definition());
    delete this._definitionQueue;
  }

  async whenDefined<C extends object>(componentType: ComponentClass<C>): Promise<ComponentFactory<C>> {
    await this.customElements.whenDefined(componentType);
    return componentFactoryOf(componentType);
  }

}
