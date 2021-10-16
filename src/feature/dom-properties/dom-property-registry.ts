import { CxEntry, cxScoped, cxSingle } from '@proc7ts/context-values';
import { Class } from '@proc7ts/primitives';
import { ComponentContext } from '../../component';
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
   * @param descriptor - Property descriptor.
   */
  declareDomProperty(descriptor: DomPropertyDescriptor): void;

}

/**
 * Component definition context entry containing {@link DomPropertyRegistry DOM property registry}.
 *
 * @category Feature
 */
export const DomPropertyRegistry: CxEntry<DomPropertyRegistry> = {
  perContext: (/*#__PURE__*/ cxScoped(
      DefinitionContext,
      (/*#__PURE__*/ cxSingle({
        byDefault: target => new DomPropertyRegistry$(target.get(DefinitionContext)),
      })),
  )),
  toString: () => '[DomPropertyRegistry]',
};

class DomPropertyRegistry$ implements DomPropertyRegistry {

  private readonly props = new Map<PropertyKey, PropertyDescriptor>();

  constructor(defContext: DefinitionContext) {
    defContext.whenReady(
        ({ elementType }) => this.define(elementType),
    );
    defContext.whenComponent(context => {
      if (context.mounted) {
        // Mount element properties
        this.mount(context);
      }
    });
  }

  declareDomProperty({ key, descriptor }: DomPropertyDescriptor): void {
    this.props.set(key, descriptor);
  }

  private define<T extends object>(elementType: Class<T>): void {

    const prototype = elementType.prototype;

    this.props.forEach((desc, key) => {
      Reflect.defineProperty(prototype, key, desc);
    });
  }

  private mount<T extends object>({ element }: ComponentContext<T>): void {
    this.props.forEach((desc, key) => {
      Reflect.defineProperty(element as object, key, desc);
    });
  }

}
