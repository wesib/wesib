/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { ContextRef, SingleContextKey } from '@proc7ts/context-values';
import { Class } from '../../common';
import { ComponentMount } from '../../component';
import { DefinitionContext } from '../../component/definition';
import { DomPropertyDescriptor } from './dom-property-descriptor';

/**
 * A registry of component's element properties.
 *
 * @category Feature
 */
export interface DomPropertyRegistry {

  /**
   * Declares component element's property.
   *
   * @param descriptor  Property descriptor.
   */
  declareDomProperty(descriptor: DomPropertyDescriptor): void;

}

/**
 * A key of component definition context value containing {@link DomPropertyRegistry DOM property registry}.
 *
 * @category Feature
 */
export const DomPropertyRegistry: ContextRef<DomPropertyRegistry> = (
    /*#__PURE__*/ new SingleContextKey<DomPropertyRegistry>(
        'dom-property-registry',
        {
          byDefault(context) {
            return new DomPropertyRegistry$(context.get(DefinitionContext));
          },
        },
    )
);

/**
 * @internal
 */
class DomPropertyRegistry$ implements DomPropertyRegistry {

  private _props?: Map<PropertyKey, PropertyDescriptor>;

  constructor(private readonly _context: DefinitionContext) {
  }

  get props(): Map<PropertyKey, PropertyDescriptor> {
    if (this._props) {
      return this._props;
    }

    return this._props = new Map<PropertyKey, PropertyDescriptor>(
        this._context.get(DomPropertyDescriptor)
            .map(({ key, descriptor }) => [key, descriptor]),
    );
  }

  declareDomProperty(_descriptor: DomPropertyDescriptor): void {
    // TODO Declare DOM property
  }

  define<T extends object>(elementType: Class<T>): void {

    const prototype = elementType.prototype;

    this.props.forEach((desc, key) => {
      Object.defineProperty(prototype, key, desc);
    });
  }

  mount<T extends object>(mount: ComponentMount<T>): void {

    const element = mount.element;

    this.props.forEach((desc, key) => {
      Object.defineProperty(element, key, desc);
    });
  }

}
