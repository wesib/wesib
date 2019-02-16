import { FeatureDef } from '../feature-def';
import { ConnectTracker } from './connect-tracker';

const DEF: FeatureDef = {
  set: { as: ConnectTracker },
  init(bootstrapContext) {
    bootstrapContext.get(ConnectTracker).track();
  }
};

/**
 * A feature responsible for mounted components connection state tracking.
 *
 * By default, a mounted component connection state is not tracked automatically. So, a
 * `ComponentMount.checkConnected()` should be called to update it.
 *
 * This feature tracks the DOM tree manipulation within `BootstrapRoot` and updates the mounted component connection
 * when its element is added or removed from the document.
 */
export class AutoConnectSupport {

  static get [FeatureDef.symbol](): FeatureDef {
    return DEF;
  }

}
