import { ContextRef, SingleContextKey } from '@proc7ts/context-values';
import { Workbench, WorkStage } from '@proc7ts/workbench';
import { bootstrapDefault } from '../../boot';

/**
 * @internal
 */
export type BootstrapWorkbench = Workbench;

/**
 * @internal
 */
export const BootstrapWorkbench: ContextRef<BootstrapWorkbench> = (/*#__PURE__*/ new SingleContextKey(
    'bootstrap-workbench',
    {
      byDefault: bootstrapDefault(() => new Workbench()),
    },
));

/**
 * @internal
 */
export const featureSetupStage = (/*#__PURE__*/ new WorkStage('feature setup'));

/**
 * @internal
 */
export const featureInitStage = (/*#__PURE__*/ new WorkStage('feature init', { after: featureSetupStage }));

/**
 * @internal
 */
export const componentDefStage = (/*#__PURE__*/ new WorkStage('component definition', { after: featureInitStage }));
