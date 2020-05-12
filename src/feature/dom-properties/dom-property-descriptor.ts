/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { MultiContextKey, MultiContextRef } from '@proc7ts/context-values';

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

/**
 * A key of component definition context value containing custom element property descriptors.
 *
 * @category Feature
 */
export const DomPropertyDescriptor: MultiContextRef<DomPropertyDescriptor> = (
    /*#__PURE__*/ new MultiContextKey<DomPropertyDescriptor>('dom-property-descriptor')
);
