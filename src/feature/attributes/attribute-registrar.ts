/**
 * @module @wesib/wesib
 */
import { SingleContextKey, SingleContextRef } from 'context-values';

/**
 * Custom element attribute change callback.
 *
 * This function is called whenever a new attribute value assigned.
 *
 * @category Feature
 * @typeparam T  A type of component.
 */
export type AttributeChangedCallback<T extends object = any> =
/**
 * @param this  Component instance.
 * @param newValue  New attribute value.
 * @param oldValue  Previous attribute value, or `null` if there were no value assigned.
 */
    (this: T, newValue: string, oldValue: string | null) => void;

/**
 * @category Feature
 */
export type AttributeRegistrar<T extends object = any> = (name: string, callback: AttributeChangedCallback<T>) => void;

/**
 * @category Feature
 */
export const AttributeRegistrar: SingleContextRef<AttributeRegistrar> = (
    /*#__PURE__*/ new SingleContextKey<AttributeRegistrar>('attribute-registrar')
);
