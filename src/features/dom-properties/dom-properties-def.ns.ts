import { MetaAccessor } from '../../common';
import { ComponentType } from '../../component';
import { FeatureDef } from '../../feature';
import { DomPropertiesDef } from './dom-properties-def';
import { DomPropertiesSupport } from './dom-properties-support';

declare module './dom-properties-def' {

  export namespace DomPropertiesDef {

    /**
     * Extracts DOM properties definition from web component type.
     *
     * @param <T> A type of web component.
     * @param componentType Target web component type.
     *
     * @returns DOM properties attributes definition. May be empty when there is no definition found in the given
     * `componentType`.
     */
    export function of<T extends object>(componentType: ComponentType<T>): DomPropertiesDef;

    /**
     * Merges multiple DOM properties definitions.
     *
     * @param defs DOM properties definitions to merge.
     *
     * @returns Merged DOM properties definition.
     */
    export function merge(...defs: DomPropertiesDef[]): DomPropertiesDef;

    /**
     * Defines a custom HTML element attributes.
     *
     * Either assigns new or extends an existing DOM properties definition and stores it under `DomPropertiesDef.symbol`
     * key.
     *
     * @param <T> A type of web component.
     * @param type Target web component type.
     * @param defs DOM properties definitions to apply.
     *
     * @returns The `type` instance.
     */
    export function define<T extends ComponentType>(type: T, ...defs: DomPropertiesDef[]): T;

  }

}

class DomPropertiesMeta extends MetaAccessor<DomPropertiesDef> {

  constructor() {
    super(DomPropertiesDef.symbol);
  }

  merge(...defs: DomPropertiesDef[]): DomPropertiesDef {
    return Object.assign({}, ...defs);
  }

}

const meta = new DomPropertiesMeta();

DomPropertiesDef.of = <T extends object>(componentType: ComponentType<T>) => meta.of(componentType) || {};

DomPropertiesDef.merge = (...defs: DomPropertiesDef[]) => meta.merge(...defs);

DomPropertiesDef.define = <T extends ComponentType>(type: T, ...defs: DomPropertiesDef[]) => {
  FeatureDef.define(type, { requires: [DomPropertiesSupport] });
  return meta.define(type, ...defs);
};
