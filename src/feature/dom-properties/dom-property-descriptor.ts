/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
/**
 * Component's element property descriptor.
 *
 * Descriptors used to {@link DomPropertyRegistry.declareDomProperty declare} element properties.
 * The {@link DomProperty @DomProperty} decorator is doing so.
 *
 * @category Feature
 */
export interface DomPropertyDescriptor {

  /**
   * Custom element property key.
   */
  readonly key: PropertyKey;

  /**
   * Custom element property descriptor.
   */
  readonly descriptor: PropertyDescriptor;

}
