import { CustomHTMLElementClass } from '@frontmeans/dom-primitives';
import { drekContextOf } from '@frontmeans/drek';
import { Class } from '@proc7ts/primitives';
import { ComponentElement, ComponentSlot } from '../../component';
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
    defContext: DefinitionContext$<T>,
): Class {

  const { elementDef } = defContext;
  let ensureComponentBound: () => ComponentContext$<T>;

  class CustomElement$ extends (elementDef.extend.type as CustomHTMLElementClass) implements ComponentElement {

    constructor() {
      super();

      const getComponentContext = (): ComponentContext$<T> => ComponentSlot.of<T>(this).context as ComponentContext$<T>;

      ensureComponentBound = getComponentContext;

      ComponentSlot.of<T>(this).bindBy(({ bind }) => {

        const bindComponent = (): ComponentContext$<T> => {
          ensureComponentBound = getComponentContext; // Bind once.

          const context = new ComponentContext$Custom(defContext, this);

          context.supply.whenOff(() => {
            drekContextOf(this).whenSettled(() => {
              ensureComponentBound();
            });
          });

          const supply = bind(context);

          context._createComponent();
          context._created();

          supply.whenOff(() => {
            ensureComponentBound = bindComponent; // Bind next time element connected
          });

          return context;
        };

        bindComponent();
      });
    }

    connectedCallback(): void {
      super.connectedCallback?.();
      ensureComponentBound()._connect();
    }

    disconnectedCallback(): void {
      (ComponentSlot.of<T>(this).context as ComponentContext$<T>).supply.off();
      super.disconnectedCallback?.();
    }

  }

  return CustomElement$;
}
