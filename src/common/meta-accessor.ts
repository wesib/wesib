import { Class, hasOwnProperty, superClassOf } from '@proc7ts/primitives';

/**
 * @category Utility
 */
export abstract class MetaAccessor<TMeta, TSrc = TMeta> {

  readonly symbol: symbol;

  protected constructor(symbol: symbol) {
    this.symbol = symbol;
  }

  own(type: Class, receiver?: Class): TMeta | undefined {
    return hasOwnProperty(type, this.symbol)
        ? Reflect.get(type, this.symbol, receiver)
        : undefined;
  }

  of(type: Class, receiver: Class = type): TMeta | undefined {

    const ownDef: TMeta | undefined = this.own(type, receiver);
    const superType = superClassOf(type);
    const superDef = superType && this.of(superType, receiver);

    return ownDef ? (superDef ? this.merge([superDef, ownDef]) : ownDef) : superDef;
  }

  define<TClass extends Class>(type: TClass, metas: readonly (TMeta | TSrc)[]): TClass {

    const prevMeta = this.own(type);
    const newMeta: TMeta = this.merge(prevMeta ? [prevMeta, ...metas] : metas);

    Reflect.defineProperty(
        type,
        this.symbol,
        {
          configurable: true,
          value: newMeta,
        },
    );

    return type;
  }

  abstract merge(metas: readonly (TMeta | TSrc)[]): TMeta;

}
