import { ContextKey, ContextKey__symbol, SingleContextKey } from 'context-values';
import { ComponentClass, ComponentFactory, CustomElements } from '../../component/definition';
import { BootstrapContext } from '../bootstrap-context';
import { bootstrapDefault } from '../bootstrap-default';
import { ComponentFactory__symbol, componentFactoryOf } from './component-factory.symbol.impl';
import { ElementBuilder } from './element-builder.impl';

const ComponentRegistry__key = /*#__PURE__*/ new SingleContextKey<ComponentRegistry>(
    'component-registry',
    {
      byDefault: bootstrapDefault(context => new ComponentRegistry(context)),
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
    _bootstrapContext.whenReady(() => {
      this._definitionQueue.forEach(definition => definition());
      delete this._definitionQueue;
    });
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

  async whenDefined<C extends object>(componentType: ComponentClass<C>): Promise<ComponentFactory<C>> {
    await this.customElements.whenDefined(componentType);
    return componentFactoryOf(componentType);
  }

}
