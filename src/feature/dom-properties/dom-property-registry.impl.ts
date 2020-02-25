import { ContextKey, ContextKey__symbol, SingleContextKey } from 'context-values';
import { Class } from '../../common';
import { ComponentMount } from '../../component';
import { DefinitionContext } from '../../component/definition';
import { DomPropertyDescriptor } from './dom-property-descriptor';

const DomPropertyRegistry__key = (/*#__PURE__*/ new SingleContextKey<DomPropertyRegistry>('dom-property-registry'));

/**
 * @internal
 */
export class DomPropertyRegistry {

  static get [ContextKey__symbol](): ContextKey<DomPropertyRegistry> {
    return DomPropertyRegistry__key;
  }

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
