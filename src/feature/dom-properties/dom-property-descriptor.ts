/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { MultiContextKey, MultiContextRef } from 'context-values';

/**
 * Custom element property descriptor.
 *
 * Descriptors are to be registered in component's definition context in order to make them available to component.
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
