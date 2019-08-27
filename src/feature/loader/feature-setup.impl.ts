import { BootstrapContext } from '../../boot';
import { BootstrapValueRegistry } from '../../boot/bootstrap/bootstrap-value-registry.impl';
import { ComponentRegistry } from '../../boot/definition/component-registry.impl';
import { ComponentValueRegistry } from '../../boot/definition/component-value-registry.impl';
import { DefinitionValueRegistry } from '../../boot/definition/definition-value-registry.impl';

/**
 * @internal
 */
export interface FeatureSetup {
  bootstrapContext: BootstrapContext;
  componentRegistry: ComponentRegistry;
  valueRegistry: BootstrapValueRegistry;
  definitionValueRegistry: DefinitionValueRegistry;
  componentValueRegistry: ComponentValueRegistry;
}
