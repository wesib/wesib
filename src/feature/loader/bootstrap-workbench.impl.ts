import { cxDefaultScoped, CxEntry, cxSingle } from '@proc7ts/context-values';
import { Workbench, WorkStage } from '@proc7ts/workbench';
import { BootstrapContext } from '../../boot';

export type BootstrapWorkbench = Workbench;

export const BootstrapWorkbench: CxEntry<BootstrapWorkbench> = {
  perContext: (/*#__PURE__*/ cxDefaultScoped(
      BootstrapContext,
      (/*#__PURE__*/ cxSingle({
        byDefault: () => new Workbench(),
      })),
  )),
};

export const featureSetupStage = (/*#__PURE__*/ new WorkStage('feature setup'));

export const featureInitStage = (/*#__PURE__*/ new WorkStage('feature init', { after: featureSetupStage }));

export const componentDefStage = (/*#__PURE__*/ new WorkStage('component definition', { after: featureInitStage }));
