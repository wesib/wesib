/**
 * Custom element attribute change callback signature.
 *
 * This function is called whenever a new attribute value assigned.
 *
 * @category Feature
 * @typeParam T - A type of component.
 */
export type AttributeChangedCallback<T extends object> =
/**
 * @param component - Component instance.
 * @param newValue - New attribute value, or `null` when attribute removed.
 * @param oldValue - Previous attribute value, or `null` if attribute did not exist.
 */
    (this: void, component: T, newValue: string | null, oldValue: string | null) => void;

/**
 * Component's element attribute descriptor.
 *
 * Descriptors are used to {@link AttributeRegistry.declareAttribute declare} element attributes.
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
