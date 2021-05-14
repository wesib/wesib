import { ContextRef, SingleContextKey } from '@proc7ts/context-values';
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
      Reflect.defineProperty(element, key, desc);
    });
  }

}
