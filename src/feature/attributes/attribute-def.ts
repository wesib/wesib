/**
 * @module @wesib/wesib
 */
import { StatePath } from 'fun-events';
import { AttributePath } from './attribute-path';

/**
 * Attribute definition.
 *
 * This is passed to `@Attribute` and `@AttributeChanged` decorators.
 */
export interface AttributeDef<T extends object> {

  /**
   * Attribute name.
   *
   * This is required if annotated property's key is not a string (i.e. a symbol). Otherwise,
   * the attribute name is equal to the property name by default.
   */
  readonly name?: string;

  /**
   * Whether to update the component state after attribute change.
   *
   * Can be one of:
   * - `false` to not update the component state,
   * - `true` (the default value) to update the component state with changed attribute key,
   * - a state value key to update, or
   * - an attribute update receiver function with custom state update logic.
   */
  readonly updateState?: boolean | StatePath | AttributeUpdateReceiver<T>;

}

/**
 * Attribute updates receiver invoked after custom element attribute change.
 *
 * @typeparam T  A type of component.
 * @param this  Component instance.
 * @param path  The changed attribute state path in the form of `[attributePathRoot, attributeName]`.
 * @param newValue  New attribute value.
 * @param oldValue  Previous attribute value, or `null` if there were no value assigned.
 */
export type AttributeUpdateReceiver<T extends object> = (
    this: T,
    path: AttributePath,
    newValue: string,
    oldValue: string | null) => void;
