/**
 * @module @wesib/wesib
 */
import { Class, superClassOf } from './classes';

export abstract class MetaAccessor<M> {

  readonly symbol: symbol;

  protected constructor(symbol: symbol) {
    this.symbol = symbol;
  }

  of(type: Class): M | undefined {

    const def = (type as any)[this.symbol];
    const superType = superClassOf(type, st => this.symbol in st);
    const superDef = superType && this.of(superType);

    if (!def) {
      return;
    }

    return superDef && superDef !== def ? this.merge(superDef, def) : def;
  }

  define<C extends Class>(type: C, ...defs: M[]): C {

    const prevDef = this.of(type);
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
        });

    return type;
  }

  abstract merge(...defs: M[]): M;

}
