/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { FnContextKey } from '@proc7ts/context-values/updatable';
import { filterArray, itsEach, overArray } from '@proc7ts/push-iterator';
import { isElement } from '../../common';
import { ComponentContext__symbol, ComponentContextHolder, ComponentMount } from '../../component';
import { bootstrapDefault } from '../bootstrap-default';
import { ElementAdapter } from './element-adapter';

/**
 * Element mutations observer.
 *
 * It is a `MutationObserver` implementation that:
 * - always observes target's children,
 * - applies {@link ElementAdapter element adapter} to added elements,
 * - tracks mounted components {@link ComponentMount.connected connection state}.
 *
 * A function constructing element observer instance could be obtained from bootstrap context.
 *
 * @category Core
 */
export interface ElementObserver extends MutationObserver {

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
  observe(target: Node, options?: ElementObserverInit): void;

}

/**
 * A key of bootstrap context value containing a function constructing a new [[ElementObserver]] instance.
 *
 * @category Core
 */
export const ElementObserver: FnContextKey<[MutationCallback], ElementObserver> = (/*#__PURE__*/ new FnContextKey(
    'element-observer',
    {
      byDefault: bootstrapDefault(bsContext => {

        const adapter = bsContext.get(ElementAdapter);
        class DefaultElementObserver extends MutationObserver implements ElementObserver {

          constructor(callback: MutationCallback) {
            super(mutations => {
              mutations.forEach(mutation => {
                itsEach(
                    overArray(mutation.removedNodes),
                    node => mountOf(node as ComponentContextHolder)?.checkConnected(),
                );
                itsEach(
                    filterArray(mutation.addedNodes, isElement),
                    element => adapter(element)?.mount?.checkConnected(),
                );
              });
              callback(mutations, this);
            });
          }

          observe(target: Node, options?: ElementObserverInit): void {
            super.observe(target, { ...options, childList: true });
          }

        }

        return callback => new DefaultElementObserver(callback);
      }),
    },
));

/**
 * Element observer initialization options.
 *
 * @category Core
 */
export interface ElementObserverInit extends MutationObserverInit {

  /**
   * Whether mutations to target's children are to be observed.
   *
   * Always `true`.
   */
  childList?: true;

}

/**
 * @internal
 */
function mountOf(node: ComponentContextHolder): ComponentMount | undefined {
  return node[ComponentContext__symbol]?.mount;
}
