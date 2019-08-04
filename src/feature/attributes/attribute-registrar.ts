/**
 * @module @wesib/wesib
 */
import { ContextRequest, ContextTarget, SingleContextKey } from 'context-values';

/**
 * Custom element attribute change callback.
 *
 * This function is called whenever a new attribute value assigned.
 *
 * @typeparam T  A type of component.
 * @param this  Component instance.
 * @param newValue  New attribute value.
 * @param oldValue  Previous attribute value, or `null` if there were no value assigned.
 */
export type AttributeChangedCallback<T extends object = any> =
    (this: T, newValue: string, oldValue: string | null) => void;

export type AttributeRegistrar<T extends object = any> = (name: string, callback: AttributeChangedCallback<T>) => void;

export const AttributeRegistrar: ContextTarget<AttributeRegistrar> & ContextRequest<AttributeRegistrar> =
    /*#__PURE__*/ new SingleContextKey<AttributeRegistrar>('attribute-registrar');
