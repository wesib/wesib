/**
 * @module @wesib/wesib
 */
import { AIterable } from 'a-iterable';
import { ContextValueOpts, ContextValues, SimpleContextKey, SingleContextRef } from 'context-values';
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
 * @returns An adapted component's context, or `null` if the element can not be adapted.
 */
    (this: void, element: any) => ComponentContext | undefined;

class Key extends SimpleContextKey<ElementAdapter> {

  constructor() {
    super('element-adapter');
  }

  grow<Ctx extends ContextValues>(
      opts: ContextValueOpts<Ctx, ElementAdapter, ElementAdapter, AIterable<ElementAdapter>>,
  ): ElementAdapter | null | undefined {

    const result = opts.seed.reduce(
        (prev, adapter) => (element: any) => prev(element) || adapter(element),
        defaultElementAdapter,
    );

    return result !== defaultElementAdapter ? result : opts.byDefault(() => defaultElementAdapter);
  }

}

/**
 * A key of bootstrap context value containing an [[ElementAdapter]] instance.
 *
 * @category Core
 */
export const ElementAdapter: SingleContextRef<ElementAdapter> = /*#__PURE__*/ new Key();

function defaultElementAdapter(element: any): ComponentContext | undefined {
  return element[ComponentContext__symbol];
}
