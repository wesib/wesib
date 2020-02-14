/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { MultiContextKey, MultiContextRef } from 'context-values';

/**
 * Custom element attribute change callback signature.
 *
 * This function is called whenever a new attribute value assigned.
 *
 * @category Feature
 * @typeparam T  A type of component.
 */
export type AttributeChangedCallback<T extends object> =
/**
 * @param component  Component instance.
 * @param newValue  New attribute value.
 * @param oldValue  Previous attribute value, or `null` if there were no value assigned.
 */
    (this: void, component: T, newValue: string, oldValue: string | null) => void;

/**
 * Custom element attribute descriptor.
 *
 * Descriptors are to be registered in component's definition context in order to make them available to component.
 * The {@link Attribute @Attribute}, {@link Attributes @Attributes}, and {@link AttributeChanged @AttributeChanged}
 * decorators are doing so.
 *
 * @category Feature
 */
export interface AttributeDescriptor<T extends object = any> {

  /**
   * Attribute name.
   */
  readonly name: string;

  /**
   * Attribute change callback that will be called each time attribute value changes.
   */
  readonly change: AttributeChangedCallback<T>;

}

/**
 * A key of component definition context value containing attribute descriptors.
 *
 * @category Feature
 */
export const AttributeDescriptor: MultiContextRef<AttributeDescriptor> = (
    /*#__PURE__*/ new MultiContextKey<AttributeDescriptor>('attribute-descriptor')
);
