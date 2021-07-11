import { RenderScheduler } from '@frontmeans/render-scheduler';
import { CxEntry, cxRecent, CxValues } from '@proc7ts/context-values';
import { BootstrapWindow } from './bootstrap-window';

export function cxRenderScheduler(byDefault: RenderScheduler): CxEntry.Definer<RenderScheduler> {
  return cxRecent({
    create: RenderScheduler$adopt,
    byDefault: target => RenderScheduler$adopt(byDefault, target),
  });
}

function RenderScheduler$adopt(scheduler: RenderScheduler, context: CxValues): RenderScheduler {
  return (options = {}) => scheduler({
    ...options,
    window: options.window || context.get(BootstrapWindow),
  });
}
