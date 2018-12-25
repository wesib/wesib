import { ComponentClass } from '../../component';
import { ComponentFactory, CustomElements } from '../../component/definition';
import { BootstrapContext } from '../bootstrap-context';
import { ElementBuilder } from './element-builder';

/**
 * @internal
 */
export const COMPONENT_FACTORY = Symbol('component-factory');

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
      (componentType as any)[COMPONENT_FACTORY] = factory;

      this.customElements.define(componentType, factory.elementType);
    });
  }

  complete() {
    this._definitionQueue.forEach(definition => definition());
    delete this._definitionQueue;
  }

  async whenDefined<C extends object>(componentType: ComponentClass<C>): Promise<ComponentFactory<C>> {
    await this.customElements.whenDefined(componentType);

    const factory = (componentType as any)[COMPONENT_FACTORY];

    if (!factory) {
      throw new TypeError(`Component is not defined: ${componentType}`);
    }

    return factory;
  }

}
