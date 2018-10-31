import { SingleValueKey, StatePath } from '../../common';

/**
 * Custom element attribute change callback.
 *
 * This function is called whenever a new attribute value assigned.
 *
 * @param <T> A type of component.
 * @param this Component instance.
 * @param newValue New attribute value.
 * @param oldValue Previous attribute value, or `null` if there were no value assigned.
 */
export type AttributeChangedCallback<T extends object = object> =
    (this: T, newValue: string, oldValue: string | null) => void;

/**
 * Attribute updates consumer invoked after custom element attribute change.
 *
 * @param <T> A type of component.
 * @param this Component instance.
 * @param path The changed attribute state path in the form of `[StatePath.attribute, attributeName]`.
 * @param newValue New attribute value.
 * @param oldValue Previous attribute value, or `null` if there were no value assigned.
 */
export type AttributeUpdateConsumer<T extends object> = (
    this: T,
    path: [typeof StatePath.attribute, string],
    newValue: string,
    oldValue: string | null) => void;

export type AttributeRegistrar<T extends object> = (name: string, callback: AttributeChangedCallback<T>) => void;

export namespace AttributeRegistrar {

  export const key = new SingleValueKey<AttributeRegistrar<any>>('attribute-registrar');

}
