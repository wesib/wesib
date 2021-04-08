import { RenderShot } from '@frontmeans/render-scheduler';
import { ComponentRendererExecution } from './component-renderer-execution';

/**
 * Component renderer signature.
 *
 * Renderer execution is controlled by {@link ComponentRenderCtl.renderBy component render control}.
 *
 * @category Feature
 * @typeParam TExecution - A type of supported component render execution context.
 */
export type ComponentRenderer<TExecution extends ComponentRendererExecution = ComponentRendererExecution> =
    RenderShot<TExecution>;
