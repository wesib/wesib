import { ComponentValueKey } from '../component';
import { WebComponent } from '../decorators';
import { ComponentRegistry } from '../element/component-registry';
import { ElementBuilder } from '../element/element-builder';
import { ProviderRegistry } from '../element/provider-registry';
import { Components } from './components';
import './components-bootstrap';
import Spy = jasmine.Spy;
import SpyObj = jasmine.SpyObj;

describe('api/bootstrap', () => {

  let opts: Components.Config;
  let createProviderRegistrySpy: Spy;
  let providerRegistrySpy: SpyObj<ProviderRegistry>;
  let createElementBuilderSpy: Spy;
  let elementBuilderSpy: SpyObj<ElementBuilder>;
  let createComponentRegistrySpy: Spy;
  let componentRegistrySpy: SpyObj<ComponentRegistry>;
  let comps: Components;

  beforeEach(() => {
    opts = { window: 'components window' as any };

    providerRegistrySpy = jasmine.createSpyObj(
        'providerRegistry',
        [
          'provide',
          'get',
        ]);
    createProviderRegistrySpy = spyOn(ProviderRegistry, 'create').and.returnValue(providerRegistrySpy);

    elementBuilderSpy = jasmine.createSpyObj(
        'elementBuilder',
        [
            'buildElement',
            'onElement',
        ]);
    createElementBuilderSpy = spyOn(ElementBuilder, 'create').and.returnValue(elementBuilderSpy);

    componentRegistrySpy = jasmine.createSpyObj(
        'componentRegistry',
        [
          'define',
          'whenDefined',
          'onComponentDefinition',
          'onElementDefinition',
        ]);
    createComponentRegistrySpy = spyOn(ComponentRegistry, 'create').and.returnValue(componentRegistrySpy);
    comps = Components.bootstrap(opts);
  });

  describe('Components', () => {
    describe('bootstrap', () => {
      it('constructs provider registry', () => {
        expect(createProviderRegistrySpy).toHaveBeenCalledWith();
      });
      it('constructs element builder', () => {
        expect(createElementBuilderSpy).toHaveBeenCalledWith({
          window: opts.window,
          providerRegistry: providerRegistrySpy,
        });
      });
      it('constructs component registry', () => {
        expect(createComponentRegistrySpy).toHaveBeenCalledWith({
          builder: elementBuilderSpy,
        });
      });
    });

    it('proxies define() method', () => {
      componentRegistrySpy.define.and.returnValue(HTMLDivElement);

      @WebComponent({ name: 'test-component', extend: { name: 'div', type: HTMLDivElement } })
      class TestComponent {}

      expect(comps.define(TestComponent)).toBe(HTMLDivElement);
      expect(componentRegistrySpy.define).toHaveBeenCalledWith(TestComponent);
    });
    it('proxies whenDefined() method', () => {

      const promise = Promise.resolve<any>('abc');

      componentRegistrySpy.whenDefined.and.returnValue(promise);

      @WebComponent({ name: 'test-component', extend: { name: 'div', type: HTMLDivElement } })
      class TestComponent {}

      expect(comps.whenDefined(TestComponent)).toBe(promise);
      expect(componentRegistrySpy.whenDefined).toHaveBeenCalledWith(TestComponent);
    });
    it('proxies provide() method', () => {

      const key = new ComponentValueKey<string>('test-value-key');
      const provider = () => 'test-value';

      comps.provide(key, provider);

      expect(providerRegistrySpy.provide).toHaveBeenCalledWith(key, provider);
    });
    it('proxies onComponentDefinition() method', () => {

      const listener = () => {};

      comps.onComponentDefinition(listener);
      expect(componentRegistrySpy.onComponentDefinition).toHaveBeenCalledWith(listener);
    });
    it('proxies onElementDefinition() method', () => {

      const listener = () => {};

      comps.onElementDefinition(listener);
      expect(componentRegistrySpy.onElementDefinition).toHaveBeenCalledWith(listener);
    });
    it('proxies onElement() method', () => {

      const listener = () => {};

      comps.onElement(listener);
      expect(elementBuilderSpy.onElement).toHaveBeenCalledWith(listener);
    });
  });
});
