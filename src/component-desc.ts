export interface ComponentDesc<HTE extends HTMLElement = HTMLElement> {
  name: string;
  elementType?: { new(): HTE };
  properties?: PropertyDescriptorMap;
}

export function mergeComponentDescs(...descs: Partial<ComponentDesc>[]): Partial<ComponentDesc> {
  return descs.reduce(
      (prev, desc) => ({
        ...prev,
        ...desc,
      }),
      {});
}
