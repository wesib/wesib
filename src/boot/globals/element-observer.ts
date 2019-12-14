/**
 * @module wesib/wesib
 */
import { filterIt, itsEach, overArray } from 'a-iterable';
import { ContextKey__symbol, ContextUpKey, FnContextKey } from 'context-values';
import { isElement } from '../../common';
import { ComponentContext__symbol, ComponentMount } from '../../component';
import { bootstrapDefault } from '../bootstrap-default';
import { ElementAdapter } from './element-adapter';

const ElementObserver__key = /*#__PURE__*/ new FnContextKey<[MutationCallback], ElementObserver>(
    'element-observer',
    {
      byDefault: bootstrapDefault(bsContext => {

        const adapter = bsContext.get(ElementAdapter);
        class DefaultElementObserver extends ElementObserver {

          constructor(callback: MutationCallback) {
            super(mutations => {
              mutations.forEach(mutation => {
                itsEach(
                    overArray(mutation.removedNodes),
                    node => mountOf(node)?.checkConnected(),
                );
                itsEach(
                    filterIt(
                        overArray(mutation.addedNodes),
                        isElement,
                    ),
                    element => adapter(element)?.mount?.checkConnected(),
                );
              });
              callback(mutations, this);
            });
          }

        }

        return callback => new DefaultElementObserver(callback);
      }),
    },
);

/**
 * Element mutations observer.
 *
 * It is a `MutationObserver` implementation that:
 * - always observes target's children,
 * - applies {@link ElementAdapter element adapter} to added elements,
 * - tracks mounted components {@link ComponentMount.connected connection state}.
 *
 * The class is abstract. The function constructing an instance could be obtained from bootstrap context.
 */
export abstract class ElementObserver extends MutationObserver {

  /**
   * A key of bootstrap context value containing a function constructing a new [[ElementObserver]] instance.
   */
  static get [ContextKey__symbol](): ContextUpKey<
      (this: void, callback: MutationCallback) => ElementObserver,
      (this: void, callback: MutationCallback) => ElementObserver> {
    return ElementObserver__key;
  }

  /**
   * Configures the observer callback to begin receiving notifications of changes to the DOM that match the given
   * options.
   * To stop the MutationObserver (so that none of its callbacks will be triggered any longer), call
   * [[disconnect]].
   *
   * @param target  A DOM node within the DOM tree to watch for changes, and to be the root of a subtree of nodes
   * to be watched.
   * @param options  An options that describe what DOM mutations should be reported to the observer's callback.
   */
  observe(target: Node, options?: ElementObserverInit): void {
    super.observe(target, { ...options, childList: true });
  }

}

/**
 * Element observer initialization options.
 */
export interface ElementObserverInit extends MutationObserverInit {

  /**
   * Whether mutations to target's children are to be observed.
   *
   * Always `true`.
   */
  childList?: true;

}

function mountOf(node: any): ComponentMount | undefined {
  return node[ComponentContext__symbol]?.mount;
}
