import { ContextUpKey, ContextValueOpts, ContextValues } from 'context-values';
import { AfterEvent, EventKeeper } from 'fun-events';
import { BootstrapContext } from '../../boot';
import { Class } from '../../common';
import { FeatureLoader, loadFeature } from './feature-loader.impl';
import { FeatureClause } from './feature-request.impl';

const FeatureKey__symbol = /*#__PURE__*/ Symbol('feature-key');

/**
 * @internal
 */
export class FeatureKey extends ContextUpKey<AfterEvent<[FeatureLoader?]>, FeatureClause> {

  static of(feature: Class): FeatureKey {

    const feat = feature as any;

    return feat[FeatureKey__symbol] || (feat[FeatureKey__symbol] = new FeatureKey(feature));
  }

  private constructor(feature: Class) {
    super(`feature:${feature.name}`);
  }

  grow<Ctx extends ContextValues>(
      opts: ContextValueOpts<
          Ctx,
          AfterEvent<[FeatureLoader?]>,
          EventKeeper<FeatureClause[]> | FeatureClause,
          AfterEvent<FeatureClause[]>>,
  ): AfterEvent<[FeatureLoader?]> | null | undefined {
    return loadFeature(
        opts.context.get(BootstrapContext),
        opts.seed.keep.thru(preferredFeatureClause),
    );
  }

}

function preferredFeatureClause(...clauses: FeatureClause[]): FeatureClause | undefined {

  let required = false;
  let preferred: FeatureClause | undefined;

  for (const clause of clauses) {
    switch (clause[1]) {
      case 'is':
        required = true;
        if (!preferred) {
          preferred = clause;
        }
        break;
      case 'has':
        preferred = clause;
        break;
      case 'needs':
        required = true;
    }
  }

  return required ? preferred : undefined;
}
