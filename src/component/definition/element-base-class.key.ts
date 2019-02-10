import { SingleContextKey } from 'context-values';
import { BootstrapWindow } from '../../kit';
import { ComponentDef } from '../component-def';
import { definitionContextKey } from './definition-context.key';
import { ElementBaseClass } from './element-base-class';

/**
 * @internal
 */
export const elementBaseClassKey = new SingleContextKey<ElementBaseClass>(
    'element-base-class',
    values => {

      const componentType = values.get(definitionContextKey).componentType;
      const extend = ComponentDef.of(componentType).extend;

      return extend && extend.type || (values.get(BootstrapWindow) as any).HTMLElement;
    });
