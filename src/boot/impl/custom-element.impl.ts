import { Class } from '../../common';
import { ComponentContext__symbol } from '../../component';
import { ElementDef } from '../../component/definition';
import { ComponentContext$ } from './component-context.impl';
import { DefinitionContext$ } from './definition-context.impl';

class CustomComponentContext$<T extends object> extends ComponentContext$<T> {

  get mount(): undefined {
    return;
  }

}

/**
 * @internal
 */
export function customElementType<T extends object>(
    definitionContext: DefinitionContext$<T>,
): Class {

  const elementDef = definitionContext.get(ElementDef);

  class CustomElement$ extends elementDef.extend.type {

    // Component context reference
    [ComponentContext__symbol]: CustomComponentContext$<T>;

    constructor() {
      super();

      const context = new CustomComponentContext$(definitionContext, this);

      context._createComponent();
      context._created();
    }

    connectedCallback(): void {
      super.connectedCallback?.();
      this[ComponentContext__symbol]._connect();
    }

    disconnectedCallback(): void {
      this[ComponentContext__symbol].destroy();
      super.disconnectedCallback?.();
    }

  }

  return CustomElement$;
}
