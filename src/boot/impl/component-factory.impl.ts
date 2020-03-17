import { Class } from '../../common';
import { ComponentContext__symbol, ComponentMount } from '../../component';
import { ComponentClass, ComponentFactory, ElementDef } from '../../component/definition';
import { MountComponentContext$ } from './component-mount.impl';
import { DefinitionContext$ } from './definition-context.impl';

/**
 * @internal
 */
export class ComponentFactory$<T extends object> extends ComponentFactory<T> {

  constructor(private readonly _definitionContext: DefinitionContext$<T>) {
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

    const context = new MountComponentContext$(this._definitionContext, element);

    context._createComponent();

    const { mount } = context;

    mount.checkConnected();
    context._created();

    return mount;
  }

}
