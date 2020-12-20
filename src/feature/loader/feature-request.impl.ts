import { Class, setOfElements, Supply, SupplyPeer } from '@proc7ts/primitives';
import { ComponentDef, ComponentDef__symbol } from '../../component';
import { FeatureDef } from '../feature-def';
import { FeatureNeedsError } from '../feature-needs-error';
import { FeatureKey } from './feature-loader.impl';
import { FeatureRequester } from './feature-requester.impl';

/**
 * @internal
 */
export type FeatureClause = [FeatureRequest, 'is' | 'needs' | 'has', Class];

/**
 * @internal
 */
export type FeatureNeedClause = [FeatureRequest, 'needs' | 'has', Class];

/**
 * @internal
 */
export class FeatureRequest implements SupplyPeer {

  readonly def: FeatureDef.Options;
  readonly supply = new Supply();
  private _uses = 0;

  constructor(
      private readonly _requester: FeatureRequester,
      readonly feature: Class,
  ) {
    this.def = featureDef(feature);
  }

  request(clauses: readonly FeatureNeedClause[]): this {

    const requester = this._requester;
    const { registry } = requester;
    const isClause: FeatureClause = [this, 'is', this.feature];

    registry.provide({
      a: FeatureKey.of(this.feature),
      is: isClause,
    }).needs(this);

    for (const feature of setOfElements(this.def.has)) {

      const clause: FeatureNeedClause = [this, 'has', feature];

      registry.provide({ a: FeatureKey.of(feature), is: clause }).needs(this);

      // Request the provided feature _after_ provider
      const request = requester.request(feature, [...clauses, clause]);

      this.supply.whenOff(() => request.unuse());
    }

    for (const feature of setOfElements(this.def.needs)) {

      const clause: FeatureNeedClause = [this, 'needs', feature];
      const request = requester.request(feature, [...clauses, clause]);

      this.supply.whenOff(() => request.unuse());
      registry.provide({ a: FeatureKey.of(feature), is: clause }).needs(this);
    }

    this._uses = 1;

    return this;
  }

  reuse(clauses: readonly FeatureNeedClause[]): this {
    if (!this._uses) {
      throw new FeatureNeedsError(clauses.map(
          ([{ feature }, reason, need]) => [feature, reason, need],
      ));
    }

    ++this._uses;

    return this;
  }

  unuse(): void {
    if (!--this._uses) {
      this.supply.off();
    }
  }

}

function featureDef(featureType: Class): FeatureDef.Options {

  let def = FeatureDef.of(featureType);

  if (ComponentDef__symbol in featureType) {
    def = FeatureDef.merge(
        def,
        {
          init(context) {
            context.define(featureType);
          },
        },
    );

    const { feature } = ComponentDef.of(featureType);

    if (feature) {
      def = FeatureDef.merge(def, feature);
    }

  }

  return def;
}

