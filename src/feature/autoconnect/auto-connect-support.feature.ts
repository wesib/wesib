import { Feature } from '../feature.decorator';
import { ConnectTracker } from './connect-tracker';

/**
 * A feature responsible for mounted components connection state tracking.
 *
 * By default, a mounted component connection state is not tracked automatically. So, a
 * `ComponentMount.checkConnected()` should be called to update it.
 *
 * This feature tracks the DOM tree manipulation within `BootstrapRoot` and updates the mounted component connection
 * when its element is added or removed from the document.
 */
@Feature({
  set: { as: ConnectTracker },
  init(bootstrapContext) {
    bootstrapContext.get(ConnectTracker).track();
  }
})
export class AutoConnectSupport {}
