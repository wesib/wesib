import { ComponentContext } from './component-context';

/**
 * A mount of the component to an element.
 *
 * This is constructed when a component is mounted to arbitrary element by {@link DefinitionContext.mountTo} method.
 *
 * Mounted components connection state is maintained by [Document Render Kit].
 *
 * [Document Render Kit]: https://www.npmjs.com/package/@frontmeans/drek
 *
 * @category Core
 * @typeParam T - A type of component.
 */
export abstract class ComponentMount<T extends object = any> {

  /**
   * Mounted component context.
   */
  abstract readonly context: ComponentContext<T>;

  /**
   * Mounted component.
   */
  get component(): T {
    return this.context.component;
  }

  /**
   * An element the component is mounted to.
   */
  get element(): any {
    return this.context.element as unknown;
  }

}
