/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { Class, superClassOf } from '@proc7ts/primitives';

/**
 * @category Utility
 */
export abstract class MetaAccessor<M, S = M> {

  readonly symbol: symbol;

  protected constructor(symbol: symbol) {
    this.symbol = symbol;
  }

  own(type: Class): M | undefined {
    // eslint-disable-next-line no-prototype-builtins,@typescript-eslint/no-unsafe-member-access
    return type.hasOwnProperty(this.symbol) ? (type as any)[this.symbol] as M : undefined;
  }

  of(type: Class): M | undefined {

    const ownDef: M | undefined = this.own(type);
    const superType = superClassOf(type);
    const superDef = superType && this.of(superType);

    return ownDef ? (superDef ? this.merge([superDef, ownDef]) : ownDef) : superDef;
  }

  define<C extends Class>(type: C, sources: readonly S[]): C {

    const prevMeta = this.own(type);
    const updates = sources.map(source => this.meta(source, type));
    const newMeta: M = this.merge(prevMeta ? [prevMeta, ...updates] : updates);

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

  abstract merge(metas: readonly M[]): M;

  protected abstract meta(source: S, type: Class): M;

}
