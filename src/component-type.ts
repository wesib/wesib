export const componentDesc = Symbol('web-component-descriptor');

export interface ComponentDesc {
  name: string;
  properties?: PropertyDescriptorMap;
}

export interface ComponentType<T extends object = object> {
  readonly [componentDesc]?: ComponentDesc;
  new(): T;
}

export function mergeComponentDescs(...descs: Partial<ComponentDesc>[]): Partial<ComponentDesc> {
  return descs.reduce(
      (prev, desc) => ({
        ...prev,
        ...desc,
      }),
      {});
}

export function addComponentDesc<T extends object>(
    type: ComponentType<T>,
    ...descs: Partial<ComponentDesc>[]): typeof type {

  const componentType = type as ComponentType<T>;
  const prevDesc = componentType[componentDesc];
  let desc: ComponentDesc;

  if (prevDesc) {
    desc = mergeComponentDescs(prevDesc, ...descs) as ComponentDesc;
  } else {
    desc = mergeComponentDescs(...descs) as ComponentDesc;
  }

  Object.defineProperty(
      type,
      componentDesc,
      {
        configurable: true,
        enumerable: true,
        value: desc,
      });

  return type;
}
