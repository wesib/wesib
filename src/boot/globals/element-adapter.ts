/**
 * @module @wesib/wesib
 */
import { ContextUpKey, ContextUpRef, ContextValueOpts, ContextValues } from 'context-values';
import { AfterEvent, afterThe, EventKeeper } from 'fun-events';
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

/**
 * @internal
 */
class ElementAdapterKey extends ContextUpKey<ElementAdapter, ElementAdapter> {

  readonly upKey: ContextUpKey.UpKey<ElementAdapter, ElementAdapter>;

  constructor() {
    super('element-adapter');
    this.upKey = this.createUpKey(
        opts => opts.seed.keep.dig((...adapters) => {

          const combined: ElementAdapter = adapters.reduce(
              (prev, adapter) => element => prev(element) || adapter(element),
              defaultElementAdapter,
          );

          const defaultProvider = (): AfterEvent<[ElementAdapter]> => afterThe(defaultElementAdapter);

          return combined !== defaultElementAdapter
              ? afterThe(combined)
              : opts.byDefault(defaultProvider) || defaultProvider();
        }),
    );
  }

  grow<Ctx extends ContextValues>(
      opts: ContextValueOpts<
          Ctx,
          ElementAdapter,
          EventKeeper<ElementAdapter[]> | ElementAdapter,
          AfterEvent<ElementAdapter[]>>,
  ): ElementAdapter {

    let delegated: ElementAdapter;

    opts.context.get(
        this.upKey,
        'or' in opts ? { or: opts.or != null ? afterThe(opts.or) : opts.or } : undefined,
    )!(adapter => delegated = adapter);

    return element => delegated(element);
  }

}

/**
 * @internal
 */
function defaultElementAdapter(element: any): ComponentContext {
  return element[ComponentContext__symbol];
}

/**
 * A key of bootstrap context value containing combined [[ElementAdapter]] instance.
 *
 * @category Core
 */
export const ElementAdapter: ContextUpRef<ElementAdapter, ElementAdapter> = (/*#__PURE__*/ new ElementAdapterKey());
