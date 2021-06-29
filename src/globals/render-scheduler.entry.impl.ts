import { RenderScheduler } from '@frontmeans/render-scheduler';
import { CxEntry, cxEvaluated, CxValues } from '@proc7ts/context-values';
import { BootstrapWindow } from './bootstrap-window';

export function RenderScheduler$definer(byDefault: RenderScheduler): CxEntry.Definer<RenderScheduler> {
  return cxEvaluated(target => {

    let delegated: RenderScheduler;

    target.trackRecentAsset(evaluated => {
      delegated = RenderScheduler$adopt(target, evaluated ? evaluated.asset : byDefault);
    });

    return options => delegated(options);
  });
}

function RenderScheduler$adopt(context: CxValues, scheduler: RenderScheduler): RenderScheduler {
  return (options = {}) => scheduler({
    ...options,
    window: options.window || context.get(BootstrapWindow),
  });
}
