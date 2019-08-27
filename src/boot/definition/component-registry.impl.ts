import { ContextKey, ContextKey__symbol, SingleContextKey } from 'context-values';
import { ComponentClass, ComponentFactory, CustomElements } from '../../component/definition';
import { BootstrapContext } from '../bootstrap-context';
import { ComponentFactory__symbol, componentFactoryOf } from './component-factory.symbol.impl';
import { ElementBuilder } from './element-builder.impl';

const ComponentRegistry__key = /*#__PURE__*/ new SingleContextKey<ComponentRegistry>(
    'component-registry',
    {
      byDefault(context) {
        return new ComponentRegistry(context.get(BootstrapContext));
      }
    },
);

/**
 * @internal
 */
export class ComponentRegistry {

  static get [ContextKey__symbol](): ContextKey<ComponentRegistry> {
    return ComponentRegistry__key;
  }

  private _definitionQueue: (() => void)[] = [];

  constructor(private readonly _bootstrapContext: BootstrapContext) {
  }

  get customElements(): CustomElements {
    return this._bootstrapContext.get(CustomElements);
  }

  define<T extends object>(componentType: ComponentClass<T>) {
    this._definitionQueue.push(() => {

      const elementBuilder = this._bootstrapContext.get(ElementBuilder);
      const factory = elementBuilder.buildElement(componentType);

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
