import { SingleContextKey } from 'context-values';
import { BootstrapWindow } from '../../kit';
import { ComponentDef } from '../component-def';
import { DefinitionContext__key } from './definition.context.key';
import { ElementDef } from './element-def';

/**
 * @internal
 */
export const ElementDef__key = /*#__PURE__*/ new SingleContextKey<ElementDef>(
    'element-def',
    values => {

      const componentType = values.get(DefinitionContext__key).componentType;
      const { name, extend } = ComponentDef.of(componentType);

      const elementExtend: ElementDef.Extend = {
        get type() {
          return extend && extend.type || (values.get(BootstrapWindow) as any).HTMLElement;
        },
        get name() {
          return extend && extend.name;
        }
      };

      return {
        get name() {
          return name;
        },
        get extend() {
          return elementExtend;
        },
      };
    });
