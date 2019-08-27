import { ArraySet, Class } from '../../common';
import { FeatureDef } from '../feature-def';
import { FeatureHandle } from './feature-handle.impl';
import { FeatureLoaderDeps } from './feature-loader-deps.impl';

/**
 * @internal
 */
export class FeatureRegistry {

  private readonly _handles = new Map<Class, FeatureHandle>();

  static create(deps: FeatureLoaderDeps): FeatureRegistry {
    return new FeatureRegistry(deps);
  }

  private constructor(private readonly _deps: FeatureLoaderDeps) {
  }

  add(feature: Class, provider: Class = feature) {

    const existing = this._handles.get(feature);
    let handle = existing;

    if (!handle) {
      handle = new FeatureHandle(feature, this._deps);
    }
    handle.provideBy(provider);

    const def = FeatureDef.of(feature);

    // Add requirements before the feature itself.
    new ArraySet(def.needs).items.forEach(needed => this.add(needed));

    if (!existing) {
      this._handles.set(feature, handle);
    }

    // Add provided features after the feature itself.
    new ArraySet(def.has).items.forEach(provided => this.add(provided, feature));
  }

  async bootstrap(): Promise<void> {
    this._provideValues();
    this._initFeatures();
  }

  private _provideValues() {
    this._handles.forEach((handle, feature) => {
      if (feature === handle.provider(this._handles)) {
        handle.provideValues(feature);
      }
    });
  }

  private _initFeatures() {
    this._handles.forEach((handle, feature) => {
      if (feature === handle.provider(this._handles)) {
        handle.init(feature);
      }
    });
  }

}
