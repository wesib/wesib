import { ContextRegistry } from 'context-values';
import { EventEmitter } from 'fun-events';
import { Class } from '../../common';
import { ComponentContext, ComponentContext__symbol, ComponentMount } from '../../component';
import { ComponentClass, ComponentFactory, DefinitionContext, ElementDef } from '../../component/definition';
import { MountComponentContext$ } from './component-mount.impl';
import { WhenComponent } from './when-component.impl';

/**
 * @internal
 */
export class ComponentFactory$<T extends object> extends ComponentFactory<T> {

  constructor(
      private readonly _definitionContext: DefinitionContext<T>,
      private readonly _createRegistry: () => ContextRegistry<ComponentContext<T>>,
      private readonly _whenComponent: WhenComponent<T>,
      private readonly _components: EventEmitter<[ComponentContext]>,
  ) {
    super();
  }

  get componentType(): ComponentClass<T> {
    return this._definitionContext.componentType;
  }

  get elementType(): Class {
    return this._definitionContext.elementType;
  }

  get elementDef(): ElementDef {
    return this._definitionContext.elementDef;
  }

  mountTo(element: any): ComponentMount<T> {
    if (element[ComponentContext__symbol]) {
      throw new Error(`Element ${element} already bound to component`);
    }

    const context = new MountComponentContext$(
        element,
        this._definitionContext.componentType,
        this._createRegistry,
    );

    context._createComponent(this._whenComponent, this._components);

    const { mount } = context;

    mount.checkConnected();
    context._created();

    return mount;
  }

}
