import { StatePath } from '@proc7ts/fun-events';
import { AttributePath } from './attribute-path';

/**
 * Attribute definition.
 *
 * This is passed to {@link Attribute @Attribute} and {@link AttributeChanged @AttributeChanged} decorators.
 *
 * @category Feature
 * @typeParam T - A type of component.
 */
export interface AttributeDef<T extends object> {

  /**
   * Attribute name, either _camelCase_ or _dash-style_.
   *
   * This is required if annotated property's key is not a string (i.e. a symbol). Otherwise,
   * the attribute name is equal to the property name converted to _dash-style_ by default.
   */
  readonly name?: string | undefined;

  /**
   * Whether to update the component state after attribute change.
   *
   * Can be one of:
   * - `false` to not update the component state,
   * - `true` (the default value) to update the component state with changed attribute key,
   * - a state value key to update, or
   * - an attribute update receiver function with custom state update logic.
   */
  readonly updateState?: boolean | StatePath | AttributeUpdateReceiver<T> | undefined;

}

export namespace AttributeDef {

  /**
   * Signature of attribute updates receiver method.
   */
  export type ChangeMethod =
  /**
   * @param newValue - New attribute value, or `null` when attribute removed.
   * @param oldValue - Previous attribute value, or `null` if attribute did not exist.
   */
      (newValue: string | null, oldValue: string | null) => void;

}

/**
 * Signature of attribute updates receiver invoked after custom element attribute change.
 *
 * @category Feature
 * @typeParam T - A type of component.
 */
export type AttributeUpdateReceiver<T extends object> =
/**
 * @param component - Component instance.
 * @param path - The changed attribute state path in the form of `[AttributePath__root, attributeName]`.
 * @param newValue - New attribute value, or `null` when attribute removed.
 * @param oldValue - Previous attribute value, or `null` if attribute did not exist.
 */
    (
        this: void,
        component: T,
        path: AttributePath,
        newValue: string | null,
        oldValue: string | null,
    ) => void;
