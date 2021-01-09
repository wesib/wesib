import { ContextModule } from '@proc7ts/context-values/updatable';
import { valueProvider } from '@proc7ts/primitives';
import { ElementBuilder } from '../../boot/impl';
import { ComponentClass, CustomElements } from '../../component/definition';
import { BootstrapWorkbench, componentDefStage } from './bootstrap-workbench.impl';

/**
 * @internal
 */
export class ComponentRegistry {

  private _components?: ComponentClass[] = undefined;

  constructor(private readonly _setup: ContextModule.Setup) {
  }

  define<T extends object>(componentType: ComponentClass<T>): void {
    if (this._components) {
      this._components.push(componentType);
    } else {
      this._components = [componentType];
      this._defineAll(this._components);
    }
  }

  private _defineAll(components: ComponentClass[]): void {

    const workbench = this._setup.get(BootstrapWorkbench);
    const whenDefined = workbench.work(componentDefStage).run(() => {

      const customElements = this._setup.get(CustomElements);
      const elementBuilder = this._setup.get(ElementBuilder);

      components.forEach(componentType => {

        const defContext = elementBuilder.buildElement(componentType);

        customElements.define(componentType, defContext.elementType);
      });
      components.length = 0;
    });

    this._setup.initBy(valueProvider(whenDefined));
  }

}
