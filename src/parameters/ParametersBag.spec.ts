import { ParametersBag } from './ParametersBag';

describe('ParametersBag', () => {
  describe('add', () => {
    it('should add new parameter', () => {
      const parametersBag = new ParametersBag();
      const param = parametersBag.add(123);
      expect(param).toBe('param1');
    });
    it('should add new parameter and return it with $', () => {
      const parametersBag = new ParametersBag();
      const param = parametersBag.add(123, true);
      expect(param).toBe('$param1');
    });
  });
  describe('get', () => {
    it('should return param key if it exists', () => {
      const parametersBag = new ParametersBag(new Map([[123, 'param1']]));
      const param = parametersBag.get(123);
      expect(param).toBe('param1');
    });
    it('should return param key with $ if it exists', () => {
      const parametersBag = new ParametersBag(new Map([[123, 'param1']]));
      const param = parametersBag.get(123, true);
      expect(param).toBe('$param1');
    });
    it('should return undefined if it does not exists', () => {
      const parametersBag = new ParametersBag();
      const param = parametersBag.get(123);
      expect(param).toBeUndefined();
    });
  });
});
