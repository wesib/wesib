import { BootstrapContext } from '../../feature';
import { ComponentClass } from '../component';
import { ComponentDef } from '../component-def';
import { ElementBuilder } from './element-builder';

/**
 * @internal
 */
export class ComponentRegistry {

  readonly builder: ElementBuilder;
  private _definitionQueue: (() => void)[] = [];

  static create(opts: {
    builder: ElementBuilder
  }): ComponentRegistry {
    return new ComponentRegistry(opts);
  }

  private constructor(
      {
        builder,
      }: {
        builder: ElementBuilder
      }) {
    this.builder = builder;
  }

  get customElements(): CustomElementRegistry {
    return this.builder.bootstrapContext.get(BootstrapContext.customElementsKey);
  }

  define<T extends object>(componentType: ComponentClass<T>) {
    this._definitionQueue.push(() => {

      const def = ComponentDef.of(componentType);
      const elementClass = this.builder.buildElement(componentType);
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
