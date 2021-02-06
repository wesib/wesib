import { Class, superClassOf } from '@proc7ts/primitives';

/**
 * @category Utility
 */
export abstract class MetaAccessor<TMeta, TSrc = TMeta> {

  readonly symbol: symbol;

  protected constructor(symbol: symbol) {
    this.symbol = symbol;
  }

  own(type: Class): TMeta | undefined {
    // eslint-disable-next-line no-prototype-builtins,@typescript-eslint/no-unsafe-member-access
    return type.hasOwnProperty(this.symbol) ? (type as any)[this.symbol] as TMeta : undefined;
  }

  of(type: Class): TMeta | undefined {

    const ownDef: TMeta | undefined = this.own(type);
    const superType = superClassOf(type);
    const superDef = superType && this.of(superType);

    return ownDef ? (superDef ? this.merge([superDef, ownDef]) : ownDef) : superDef;
  }

  define<TClass extends Class>(type: TClass, sources: readonly TSrc[]): TClass {

    const prevMeta = this.own(type);
    const updates = sources.map(source => this.meta(source, type));
    const newMeta: TMeta = this.merge(prevMeta ? [prevMeta, ...updates] : updates);

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

  abstract merge(metas: readonly TMeta[]): TMeta;

  protected abstract meta(source: TSrc, type: Class): TMeta;

}
