import { CustomHTMLElementClass } from '@frontmeans/dom-primitives';
import { Class, noop } from '@proc7ts/primitives';
import { ComponentElement, ComponentSlot } from '../component';
import { DocumentRenderKit } from '../globals';
import { ComponentContext$ } from './component-context';
import { DefinitionContext$ } from './definition-context';

class ComponentContext$Custom<T extends object> extends ComponentContext$<T> {

  static create<T extends object>(
      defContext: DefinitionContext$<T>,
      element: any,
  ): ComponentContext$Custom<T> {
    return defContext._newComponentContext(
        get => new ComponentContext$Custom<T>(defContext, element, get),
    );
  }

  get mounted(): false {
    return false;
  }

}

export function customElementType<T extends object>(
    defContext: DefinitionContext$<T>,
): Class {

  const { elementDef } = defContext;
  const renderKit = defContext.get(DocumentRenderKit);

  class CustomElement$ extends (elementDef.extend.type as CustomHTMLElementClass) implements ComponentElement {

    constructor() {
      super();

      const slot = ComponentSlot.of<T>(this);

      // Ignore immediate settlement, as is typically leads to DOM manipulations prohibited inside constructor.
      let settle: () => unknown = noop;

      slot.bindBy(({ bind }) => {

        const context = ComponentContext$Custom.create(defContext, this);
        const supply = bind(context);

        context._createComponent();
        context._created();

        context.supply.needs(supply).whenOff(() => {
          renderKit.contextOf(this).whenSettled(_ => settle());
        });
      });

      renderKit.contextOf(this).whenSettled(_ => settle());

      // Assume settlement happens after constructor completion.
      settle = () => slot.rebind()!.settle();
    }

    connectedCallback(): void {
      super.connectedCallback?.();
      (ComponentSlot.of<T>(this).rebind() as ComponentContext$Custom<T>)._connect();
    }

    disconnectedCallback(): void {
      (ComponentSlot.of<T>(this).context as ComponentContext$Custom<T>).supply.off();
      super.disconnectedCallback?.();
    }

  }

  return CustomElement$;
}
