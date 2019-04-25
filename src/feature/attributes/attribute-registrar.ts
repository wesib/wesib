import { ContextRequest, ContextTarget, SingleContextKey } from 'context-values';
import { AttributePath } from './attribute-path';

/**
 * Custom element attribute change callback.
 *
 * This function is called whenever a new attribute value assigned.
 *
 * @typeparam T A type of component.
 * @param this Component instance.
 * @param newValue New attribute value.
 * @param oldValue Previous attribute value, or `null` if there were no value assigned.
 */
export type AttributeChangedCallback<T extends object = object> =
    (this: T, newValue: string, oldValue: string | null) => void;

/**
 * Attribute updates receiver invoked after custom element attribute change.
 *
 * @typeparam T A type of component.
 * @param this Component instance.
 * @param path The changed attribute state path in the form of `[attributePathRoot, attributeName]`.
 * @param newValue New attribute value.
 * @param oldValue Previous attribute value, or `null` if there were no value assigned.
 */
export type AttributeUpdateReceiver<T extends object> = (
    this: T,
    path: AttributePath,
    newValue: string,
    oldValue: string | null) => void;

export type AttributeRegistrar<T extends object> = (name: string, callback: AttributeChangedCallback<T>) => void;

export const AttributeRegistrar: ContextTarget<AttributeRegistrar<any>> & ContextRequest<AttributeRegistrar<any>> =
    /*#__PURE__*/ new SingleContextKey<AttributeRegistrar<any>>('attribute-registrar');
