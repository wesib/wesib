/**
 * @module @wesib/wesib
 */
import { Class, superClassOf } from './classes';

/**
 * @category Utility
 */
export abstract class MetaAccessor<M> {

  readonly symbol: symbol;

  protected constructor(symbol: symbol) {
    this.symbol = symbol;
  }

  of(type: Class): M | undefined {

    const def: M | undefined = type.hasOwnProperty(this.symbol) ? (type as any)[this.symbol] : undefined;
    const superType = superClassOf(type);
    const superDef = superType && this.of(superType);

    return def ? (superDef ? this.merge(superDef, def) : def) : superDef;
  }

  define<C extends Class>(type: C, ...defs: M[]): C {

    const prevDef: M | undefined = type.hasOwnProperty(this.symbol) ? (type as any)[this.symbol] : undefined;
    let def: M;

    if (prevDef) {
      def = this.merge(prevDef, ...defs);
    } else {
      def = this.merge(...defs);
    }

    Object.defineProperty(
        type,
        this.symbol,
        {
          configurable: true,
          value: def,
        },
    );

    return type;
  }

  abstract merge(...defs: M[]): M;

}
