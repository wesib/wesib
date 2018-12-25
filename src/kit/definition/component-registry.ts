import { ComponentClass } from '../../component';
import { CustomElements } from '../../component/definition';
import { BootstrapContext } from '../bootstrap-context';
import { ElementBuilder } from './element-builder';

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

      const elementType = this.elementBuilder.buildElement(componentType);

      this.customElements.define(componentType, elementType);
    });
  }

  complete() {
    this._definitionQueue.forEach(definition => definition());
    delete this._definitionQueue;
  }

  whenDefined(componentType: ComponentClass<any>): Promise<void> {
    return this.customElements.whenDefined(componentType);
  }

}
