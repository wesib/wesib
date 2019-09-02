import { noop } from 'call-thru';
import { ArraySet, Class, mergeFunctions } from '../../common';
import { FeatureDef } from '../feature-def';
import { FeatureNeedsError } from '../feature-needs-error';
import { FeatureKey } from './feature-key.impl';
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
export class FeatureRequest {

  readonly def: FeatureDef;
  private _uses = 0;
  private _revoke: () => void = noop;

  constructor(private readonly _requester: FeatureRequester, readonly feature: Class) {
    this.def = FeatureDef.of(feature);
  }

  request(clauses: readonly FeatureNeedClause[]): this {

    const requester = this._requester;
    const { registry } = requester;
    const isClause: FeatureClause = [this, 'is', this.feature];

    this._revokeBy(registry.provide({
      a: FeatureKey.of(this.feature),
      is: isClause,
    }));

    new ArraySet(this.def.has).forEach(feature => {

      const clause: FeatureNeedClause = [this, 'has', feature];

      this._revokeBy(registry.provide({ a: FeatureKey.of(feature), is: clause }));

      // Request the provided feature _after_ provider
      const request = requester.request(feature, [...clauses, clause]);

      this._revokeBy(() => request.unuse());
    });

    new ArraySet(this.def.needs).forEach(feature => {

      const clause: FeatureNeedClause = [this, 'needs', feature];

      const request = requester.request(feature, [...clauses, clause]);

      this._revokeBy(() => request.unuse());
      this._revokeBy(registry.provide({ a: FeatureKey.of(feature), is: clause }));
    });

    this._uses = 1;

    return this;
  }

  reuse(clauses: readonly FeatureNeedClause[]): this {
    if (!this._uses) {
      throw new FeatureNeedsError(clauses.map(([{ feature }, reason, need]) => [feature, reason, need]));
    }

    ++this._uses;

    return this;
  }

  unuse() {
    if (!--this._uses) {
      this._revoke();
    }
  }

  private _revokeBy(revoke: () => void) {
    this._revoke = mergeFunctions(revoke, this._revoke);
  }

}
