import { ContextKey } from 'context-values';
import { ContentRoot__key } from './content-root.key';

export type ContentRoot = ParentNode;

/**
 * Component content root node.
 */
export namespace ContentRoot {

  /**
   * A key of component context value containing a component root element.
   *
   * This is an element itself by default. But can be overridden e.g. by `@AttachShadow` decorator.
   */
  export const key: ContextKey<ContentRoot> = ContentRoot__key;

}
