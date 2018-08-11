export const componentRef = Symbol('web-component-ref');

export function componentOf<T extends object>(element: HTMLElement): T | undefined {
  return (element as any)[componentRef];
}
