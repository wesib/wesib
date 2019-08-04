/**
 * @module @wesib/wesib
 */
import { StatePath } from 'fun-events';
import { DomPropertyPath } from './dom-property-path';

/**
 * Custom element property definition.
 *
 * This is an parameter to `@DomProperty` decorator applied to component property.
 */
export interface DomPropertyDef<T extends object = any> {

  /**
   * Property key.
   *
   * Decorated property key is used by default.
   */
  readonly propertyKey?: PropertyKey;

  /**
   * Whether the declared property should be configurable.
   *
   * Defaults to `configurable` attribute of decorated property.
   */
  readonly configurable?: boolean;

  /**
   * Whether the declared property should be enumerable.
   *
   * Defaults to `enumerable` attribute of decorated property.
   */
  readonly enumerable?: boolean;

  /**
   * Whether the declared property should accept new values.
   *
   * The property can not be writable if the decorated property is not writable.
   *
   * Defaults to `writable` attribute of decorated property.
   */
  readonly writable?: boolean;

  /**
   * Whether to update the component state after this property changed.
   *
   * Can be one of:
   * - `false` to not update the component state,
   * - `true` (the default value) to update the component state with changed property key,
   * - a state value key to update, or
   * - an DOM property update receiver function with custom state update logic.
   */
  readonly updateState?: boolean | StatePath | DomPropertyUpdateReceiver<T>;

}

/**
 * DOM property updates receiver invoked after custom element property change.
 *
 * @typeparam T  A type of component.
 * @typeparam K  A type of component property keys.
 * @param this  Component instance.
 * @param path  The changed property state path in the form of `[domPropertyPathRoot, propertyKey]`.
 * @param newValue  New property value.
 * @param oldValue  Previous property value.
 */
export type DomPropertyUpdateReceiver<T extends object> = <K extends keyof T>(
    this: T,
    path: DomPropertyPath<K>,
    newValue: T[K],
    oldValue: T[K]) => void;
