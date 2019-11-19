/**
 * @module @wesib/wesib
 */
import { ContextUpKey, ContextUpRef, ContextValueOpts, ContextValues } from 'context-values';
import { AfterEvent, EventKeeper } from 'fun-events';
import { ComponentContext, ComponentContext__symbol } from '../../component';

/**
 * Element adapter is a function able to convert a raw element to component. E.g. mount a component to it.
 *
 * Features may use it internally. E.g. an `AutoConnectSupport` applies it to each added DOM element.
 *
 * Multiple element adapters can be registered in bootstrap context.
 *
 * @category Core
 */
export type ElementAdapter =
/**
 * @param element  Target raw element to adapt.
 *
 * @returns An adapted component's context, or `undefined` if element can not be adapted.
 */
    (this: void, element: any) => ComponentContext | undefined;

class ElementAdapterKey extends ContextUpKey<ElementAdapter, ElementAdapter> {

  constructor() {
    super('element-adapter');
  }

  grow<Ctx extends ContextValues>(
      opts: ContextValueOpts<
          Ctx,
          ElementAdapter,
          EventKeeper<ElementAdapter[]> | ElementAdapter, AfterEvent<ElementAdapter[]>>,
  ): ElementAdapter {

    const defaultElementAdapter = (element: any) => element[ComponentContext__symbol];

    let result: ElementAdapter;

    opts.seed((...adapters) => {

      const combined = adapters.reduce(
          (prev, adapter) => (element: any) => prev(element) || adapter(element),
          defaultElementAdapter,
      );

      result = combined !== defaultElementAdapter
          ? combined
          : opts.byDefault(() => defaultElementAdapter) || defaultElementAdapter;
    });

    return element => result(element);
  }

}

/**
 * A key of bootstrap context value containing combined [[ElementAdapter]] instance.
 *
 * @category Core
 */
export const ElementAdapter: ContextUpRef<ElementAdapter, ElementAdapter> = /*#__PURE__*/ new ElementAdapterKey();
