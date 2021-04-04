import { CustomElementClass } from '@frontmeans/drek';
import { Class } from '@proc7ts/primitives';
import { ComponentElement, ComponentSlot } from '../../component';
import { ElementDef } from '../../component/definition';
import { ComponentContext$ } from './component-context.impl';
import { DefinitionContext$ } from './definition-context.impl';

class ComponentContext$Custom<T extends object> extends ComponentContext$<T> {

  get mounted(): false {
    return false;
  }

}

/**
 * @internal
 */
export function customElementType<T extends object>(
    definitionContext: DefinitionContext$<T>,
): Class {

  const elementDef = definitionContext.get(ElementDef);

  class CustomElement$ extends (elementDef.extend.type as CustomElementClass) implements ComponentElement {

    constructor() {
      super();

      const context = new ComponentContext$Custom(definitionContext, this);

      context._createComponent();
      context._created();
    }

    connectedCallback(): void {
      super.connectedCallback?.();
      (ComponentSlot.of<T>(this).context as ComponentContext$<T>)._connect();
    }

    disconnectedCallback(): void {
      (ComponentSlot.of<T>(this).context as ComponentContext$<T>).destroy();
      super.disconnectedCallback?.();
    }

  }

  return CustomElement$;
}
