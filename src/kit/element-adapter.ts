import {
  AbstractContextKey,
  ContextKey,
  ContextSources,
  ContextValues,
  DefaultContextValueHandler,
} from 'context-values';
import { ComponentContext } from '../component';

/**
 * Element adapter.
 *
 * It is a function that able convert arbitrary element to component. Features may use it internally. E.g. an
 * `AutoConnectFeature` applies it to each added DOM element.
 *
 * Multiple element adapters can be registered in bootstrap context.
 *
 * @param element Target element to adapt.
 *
 * @returns An adapted component's context, or `null` if the element can not be adapted.
 */
export type ElementAdapter = (element: any) => ComponentContext<any> | undefined;

export namespace ElementAdapter {

  class Key extends AbstractContextKey<ElementAdapter> {

    constructor() {
      super('element-adapter');
    }

    merge(
        context: ContextValues,
        sources: ContextSources<ElementAdapter>,
        handleDefault: DefaultContextValueHandler<ElementAdapter>): ElementAdapter | null | undefined {

      const result = sources.reduce(
          (prev, adapter) => (element: any) => prev(element) || adapter(element),
          defaultElementAdapter);

      return result !== defaultElementAdapter ? result : handleDefault(() => defaultElementAdapter);
    }

  }

  /**
   * A key of bootstrap context value containing an element adapter.
   *
   * Multiple adapters can be registered. They are consulted in order of their registration, until one of them
   * return a `ComponentContext`.
   *
   * The registered adapters won't be called for elements with components bound to them.
   *
   * Bootstrap context always contains an element adapter. By default it returns a context of a component bound to the
   * given element, if any.
   */
  export const key: ContextKey<ElementAdapter> = new Key();

}

function defaultElementAdapter(element: any): ComponentContext<any> | undefined {
  return element[ComponentContext.symbol];
}
