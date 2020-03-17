import { ContextRegistry } from 'context-values';
import { EventEmitter } from 'fun-events';
import { Class } from '../../common';
import { ComponentContext, ComponentContext__symbol } from '../../component';
import { DefinitionContext, ElementDef } from '../../component/definition';
import { ComponentContext$ } from './component-context.impl';
import { WhenComponent } from './when-component.impl';

class CustomComponentContext$<T extends object> extends ComponentContext$<T> {

  get mount(): undefined {
    return;
  }

}

/**
 * @internal
 */
export function customElementType<T extends object>(
    definitionContext: DefinitionContext<T>,
    whenComponent: WhenComponent<T>,
    components: EventEmitter<[ComponentContext]>,
    createRegistry: () => ContextRegistry<ComponentContext<T>>,
): Class {

  const elementDef = definitionContext.get(ElementDef);

  class CustomElement$ extends elementDef.extend.type {

    // Component context reference
    [ComponentContext__symbol]: CustomComponentContext$<T>;

    constructor() {
      super();

      const context = new CustomComponentContext$(
          this,
          definitionContext.componentType,
          createRegistry,
          key => super[key],
      );

      context._createComponent(whenComponent, components);
      context._created();
    }

    connectedCallback(): void {
      this[ComponentContext__symbol]._connect(true);
    }

    disconnectedCallback(): void {
      this[ComponentContext__symbol]._connect(false);
    }

  }

  return CustomElement$;
}
