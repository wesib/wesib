/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { flatMapIt, mapIt } from '@proc7ts/a-iterable';
import { Class, superClassOf } from './classes';

/**
 * @category Utility
 */
export abstract class MetaAccessor<M, S = M> {

  readonly symbol: symbol;

  protected constructor(symbol: symbol) {
    this.symbol = symbol;
  }

  own(type: Class): M | undefined {
    // eslint-disable-next-line no-prototype-builtins
    return type.hasOwnProperty(this.symbol) ? (type as any)[this.symbol] : undefined;
  }

  of(type: Class): M | undefined {

    const ownDef: M | undefined = this.own(type);
    const superType = superClassOf(type);
    const superDef = superType && this.of(superType);

    return ownDef ? (superDef ? this.merge([superDef, ownDef]) : ownDef) : superDef;
  }

  define<C extends Class>(type: C, sources: Iterable<S>): C {

    const prevMeta = this.own(type);
    const updates = mapIt(sources, source => this.meta(source, type));
    const newMeta: M = this.merge(prevMeta ? flatMapIt([[prevMeta], updates]) : updates);

    Object.defineProperty(
        type,
        this.symbol,
        {
          configurable: true,
          value: newMeta,
        },
    );

    return type;
  }

  abstract merge(metas: Iterable<M>): M;

  protected abstract meta(source: S, type: Class): M;

}
