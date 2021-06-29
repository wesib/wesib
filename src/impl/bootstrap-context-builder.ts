import { CxBuilder, cxConstAsset } from '@proc7ts/context-builder';
import { CxEntry, CxGetter, cxSingle } from '@proc7ts/context-values';
import { BootstrapContext } from '../boot';

const BootstrapContextBuilder$perContext: CxEntry.Definer<BootstrapContextBuilder> = (/*#__PURE__*/ cxSingle());

export class BootstrapContextBuilder extends CxBuilder<BootstrapContext> {

  static perContext(target: CxEntry.Target<BootstrapContextBuilder>): CxEntry.Definition<BootstrapContextBuilder> {
    return BootstrapContextBuilder$perContext(target);
  }

  constructor(
      createContext: (this: void, getValue: CxGetter) => BootstrapContext,
  ) {
    super(createContext);
    this.provide(cxConstAsset(BootstrapContextBuilder, this));
    this.provide(cxConstAsset(BootstrapContext, this.context));
  }

}
