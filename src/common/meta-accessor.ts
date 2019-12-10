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

  own(type: Class): M | undefined {
    return type.hasOwnProperty(this.symbol) ? (type as any)[this.symbol] : undefined;
  }

  of(type: Class): M | undefined {

    const ownDef: M | undefined = this.own(type);
    const superType = superClassOf(type);
    const superDef = superType && this.of(superType);

    return ownDef ? (superDef ? this.merge(superDef, ownDef) : ownDef) : superDef;
  }

  define<C extends Class>(type: C, ...defs: M[]): C {

    const prevDef = this.own(type);
    const def = prevDef ? this.merge(prevDef, ...defs) : this.merge(...defs);

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
