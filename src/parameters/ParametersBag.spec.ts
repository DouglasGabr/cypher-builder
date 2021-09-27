import { ParametersBag } from './ParametersBag';

describe('ParametersBag', () => {
  describe('add', () => {
    it('should add new parameter', () => {
      const parametersBag = new ParametersBag();
      const param = parametersBag.add(123);
      expect(param).toBe('param');
    });
    it('should add new parameter and return it with $', () => {
      const parametersBag = new ParametersBag();
      const param = parametersBag.add(123, true);
      expect(param).toBe('$param');
    });
    it('should add new parameter with alias', () => {
      const parametersBag = new ParametersBag();
      const param = parametersBag.add(123, false, 'userId');
      expect(param).toBe('userId');
    });
    it('should add new parameter with alias with $', () => {
      const parametersBag = new ParametersBag();
      const param = parametersBag.add(123, true, 'userId');
      expect(param).toBe('$userId');
    });
    it('should add new parameter with incremental number if alias already exists', () => {
      const parametersBag = new ParametersBag();
      parametersBag.add(123, true, 'userId');
      const param = parametersBag.add(456, true, 'userId');
      expect(param).toBe('$userId_2');
    });
    it('should replace all non valid chars with _', () => {
      const parametersBag = new ParametersBag();
      const param = parametersBag.add(456, true, 'user.id');
      expect(param).toBe('$user_id');
    });
  });

  describe('toParametersObject', () => {
    it('should return parameter object', () => {
      const parametersBag = new ParametersBag(new Map([['test', 123]]));
      const obj = parametersBag.toParametersObject();
      expect(obj).toStrictEqual({
        test: 123,
      });
    });
  });
});
