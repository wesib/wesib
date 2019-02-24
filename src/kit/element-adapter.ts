import {
  AbstractContextKey,
  ContextKey,
  ContextSources,
  ContextValues,
  DefaultContextValueHandler,
} from 'context-values';
import { ComponentContext, componentContextSymbol } from '../component';

/**
 * Element adapter is a function able to convert a raw element to component. E.g. mount a component to it.
 *
 * Features may use it internally. E.g. an `AutoConnectSupport` applies it to each added DOM element.
 *
 * Multiple element adapters can be registered in bootstrap context.
 *
 * @param element Target raw element to adapt.
 *
 * @returns An adapted component's context, or `null` if the element can not be adapted.
 */
export type ElementAdapter = (element: any) => ComponentContext<any> | undefined;

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

const KEY = /*#__PURE__*/ new Key();

export const ElementAdapter = {

  /**
   * A key of bootstrap context value containing an `ElementAdapter` instance.
   */
  get key(): ContextKey<ElementAdapter> {
    return KEY;
  }

};

function defaultElementAdapter(element: any): ComponentContext<any> | undefined {
  return element[componentContextSymbol];
}
