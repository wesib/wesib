/**
 * @module @wesib/wesib
 */
import { SingleContextKey, SingleContextRef } from 'context-values';

/**
 * @category Feature
 */
export type DomPropertyRegistrar = (propertyKey: PropertyKey, descriptor: PropertyDescriptor) => void;

/**
 * @category Feature
 */
export const DomPropertyRegistrar: SingleContextRef<DomPropertyRegistrar> = (
    /*#__PURE__*/ new SingleContextKey<DomPropertyRegistrar>('dom-property-registrar')
);
