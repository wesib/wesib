import { BootstrapContext } from '../../feature';
import { ComponentClass } from '../component';
import { ComponentDef } from '../component-def';
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

  get customElements(): CustomElementRegistry {
    return this.bootstrapContext.get(BootstrapContext.customElementsKey);
  }

  define<T extends object>(componentType: ComponentClass<T>) {
    this._definitionQueue.push(() => {

      const def = ComponentDef.of(componentType);
      const elementClass = this.elementBuilder.buildElement(componentType);
      const ext = def.extend;

      if (ext && ext.name) {
        this.customElements.define(
            def.name,
            elementClass,
            {
              extends: ext.name,
            });
      } else {
        this.customElements.define(def.name, elementClass);
      }
    });
  }

  complete() {
    this._definitionQueue.forEach(definition => definition());
    delete this._definitionQueue;
  }

  whenDefined(componentType: ComponentClass<any>): PromiseLike<void> {
    return this.customElements.whenDefined(ComponentDef.of(componentType).name);
  }

}
