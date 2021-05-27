import { describe, expect, it, jest } from '@jest/globals';
import { bootstrapComponents } from '../bootstrap';
import { DefaultPreRenderScheduler } from './default-pre-render-scheduler';

describe('boot', () => {
  describe('DefaultPreRenderScheduler', () => {
    it('utilizes asynchronous render scheduler', async () => {

      const bsContext = await bootstrapComponents().whenReady;
      const scheduler = bsContext.get(DefaultPreRenderScheduler);
      const shot = jest.fn();

      scheduler()(shot);
      expect(shot).not.toHaveBeenCalled();

      await Promise.resolve();
      expect(shot).toHaveBeenCalled();
    });
  });
});
