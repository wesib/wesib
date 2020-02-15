/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { StatePath } from 'fun-events';
import { DomPropertyPath } from './dom-property-path';

/**
 * Custom element property definition.
 *
 * This is a parameter to {@link DomProperty @DomProperty} decorator applied to component property.
 *
 * @category Feature
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
 * @category Feature
 * @typeparam T  A type of component.
 */
export type DomPropertyUpdateReceiver<T extends object> =
/**
 * @typeparam K  A type of component property keys.
 * @param component  Component instance.
 * @param path  The changed property state path in the form of `[DomPropertyPath__root, propertyKey]`.
 * @param newValue  New property value.
 * @param oldValue  Previous property value.
 */
    <K extends keyof T>(
        this: void,
        component: T,
        path: DomPropertyPath<K>,
        newValue: T[K],
        oldValue: T[K],
    ) => void;
