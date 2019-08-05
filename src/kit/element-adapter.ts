/**
 * @module @wesib/wesib
 */
import {
  AbstractContextKey,
  ContextRequest,
  ContextSources,
  ContextTarget,
  ContextValues,
  DefaultContextValueHandler,
} from 'context-values';
import { ComponentContext, ComponentContext__symbol } from '../component';

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
    (element: any) => ComponentContext | undefined;

class Key extends AbstractContextKey<ElementAdapter> {

  constructor() {
    super('element-adapter');
  }

  merge(
      _context: ContextValues,
      sources: ContextSources<ElementAdapter>,
      handleDefault: DefaultContextValueHandler<ElementAdapter>): ElementAdapter | null | undefined {

    const result = sources.reduce(
        (prev, adapter) => (element: any) => prev(element) || adapter(element),
        defaultElementAdapter);

    return result !== defaultElementAdapter ? result : handleDefault(() => defaultElementAdapter);
  }

}

/**
 * A key of bootstrap context value containing an [[ElementAdapter]] instance.
 *
 * @category Core
 */
export const ElementAdapter: ContextTarget<ElementAdapter> & ContextRequest<ElementAdapter> = /*#__PURE__*/ new Key();

function defaultElementAdapter(element: any): ComponentContext | undefined {
  return element[ComponentContext__symbol];
}
