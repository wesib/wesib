/**
 * @module @wesib/wesib
 */
import { FeatureDef, FeatureDef__symbol } from '../feature-def';
import { ConnectTracker } from './connect-tracker.impl';

const AutoConnectSupport__feature: FeatureDef = {
  setup(setup) {
    setup.provide({ as: ConnectTracker });
  },
  init(context) {
    context.get(ConnectTracker).track();
  },
};

/**
 * A feature responsible for mounted components connection state tracking.
 *
 * By default, a mounted component connection state is not tracked automatically. So, a
 * [[ComponentMount.checkConnected]] should be called to update it.
 *
 * This feature tracks the DOM tree manipulations within [[BootstrapRoot]] with [[ElementObserver]]. The latter updates
 * the mounted component connection when its element is added or removed from the document.
 *
 * Tracks mounted components connection state within shadow root if shadow root attachment is reported by
 * {@link ShadowDomEvent wesib:shadowAttached} event.
 *
 * @category Feature
 */
export class AutoConnectSupport {

  static get [FeatureDef__symbol](): FeatureDef {
    return AutoConnectSupport__feature;
  }

}
