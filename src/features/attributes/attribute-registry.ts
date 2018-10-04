import { SingleValueKey, StateValueKey } from '../../common';

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
 * @param key The changed attribute key in the form of `[StateValueKey.attribute, attributeName]`.
 * @param newValue New attribute value.
 * @param oldValue Previous attribute value, or `null` if there were no value assigned.
 */
export type AttributeUpdateConsumer<T extends object> = (
    this: T,
    key: [typeof StateValueKey.attribute, string],
    newValue: string,
    oldValue: string | null) => void;

export interface AttributeRegistry<T extends object> {

  onAttributeChange(name: string, callback: AttributeChangedCallback<T>): void;

}

export namespace AttributeRegistry {

  export const key = new SingleValueKey<AttributeRegistry<any>>('attribute-registry');

}