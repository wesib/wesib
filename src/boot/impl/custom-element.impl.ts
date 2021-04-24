import { CustomHTMLElementClass } from '@frontmeans/dom-primitives';
import { drekContextOf } from '@frontmeans/drek';
import { Class, noop } from '@proc7ts/primitives';
import { ComponentElement, ComponentSlot } from '../../component';
import { DocumentRenderKit } from '../globals';
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

      const renderKit = defContext.get(DocumentRenderKit);
      const getComponentContext = (): ComponentContext$<T> => ComponentSlot.of<T>(this).context as ComponentContext$<T>;

      ensureComponentBound = getComponentContext;

      const slot = ComponentSlot.of<T>(this);

      // Ignore immediate settlement, as is typically leads to DOM manipulations prohibited inside constructor.
      let settle: () => unknown = noop;

      slot.bindBy(({ bind }) => {

        const bindComponent = (): ComponentContext$<T> => {
          ensureComponentBound = getComponentContext; // Bind once.

          const context = new ComponentContext$Custom(defContext, this);

          settle = () => context.settle();

          context.supply.whenOff(() => {
            drekContextOf(this).whenSettled(() => {
              settle = noop;

              const newContext = ensureComponentBound();

              renderKit.contextOf(this).whenSettled(_ => newContext.settle());
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

      renderKit.contextOf(this).whenSettled(_ => settle());

      // Assume settlement happens after constructor completion.
      settle = (): void => {
        settle = noop;
        slot.rebind();
        settle();
      };
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
