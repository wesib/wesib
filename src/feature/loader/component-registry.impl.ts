import { ElementBuilder } from '../../boot/impl';
import { ComponentFactory__symbol } from '../../boot/impl/component-factory.symbol.impl';
import { ComponentClass, CustomElements } from '../../component/definition';
import { FeatureContext } from '../feature-context';

/**
 * @internal
 */
export class ComponentRegistry {

  private _definitionQueue: (() => void)[] = [];

  constructor(private readonly _context: FeatureContext) {
    _context.whenReady(() => {
      this._definitionQueue.forEach(definition => definition());
      delete this._definitionQueue;
    });
  }

  get customElements(): CustomElements {
    return this._context.get(CustomElements);
  }

  define<T extends object>(componentType: ComponentClass<T>) {
    this._definitionQueue.push(() => {

      const elementBuilder = this._context.get(ElementBuilder);
      const factory = elementBuilder.buildElement(componentType);

      (componentType as any)[ComponentFactory__symbol] = factory;

      this.customElements.define(componentType, factory.elementType);
    });
  }

}
