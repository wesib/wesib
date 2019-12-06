import { ContextKey, ContextKey__symbol, SingleContextKey } from 'context-values';
import { BootstrapContext, bootstrapDefault } from '../../boot';
import { BootstrapContextRegistry } from '../../boot/impl';
import { Class } from '../../common';
import { FeatureNeedClause, FeatureRequest } from './feature-request.impl';

const FeatureRequester__key = /*#__PURE__*/ new SingleContextKey<FeatureRequester>(
    'feature-requester',
    {
      byDefault: bootstrapDefault(context => new FeatureRequester(context)),
    },
);

/**
 * @internal
 */
export class FeatureRequester {

  static get [ContextKey__symbol](): ContextKey<FeatureRequester> {
    return FeatureRequester__key;
  }

  readonly registry: BootstrapContextRegistry;
  private readonly _map = new Map<Class, FeatureRequest>();

  constructor(context: BootstrapContext) {
    this.registry = context.get(BootstrapContextRegistry);
  }

  request(feature: Class, clauses: readonly FeatureNeedClause[] = []): FeatureRequest {

    const existing = this._map.get(feature);

    if (existing) {
      return existing.reuse(clauses);
    }

    const request = new FeatureRequest(this, feature);

    this._map.set(feature, request);

    return request.request(clauses);
  }

}
