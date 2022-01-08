import { Builder } from './index';

describe('Builder', () => {
  describe('addParameter', () => {
    it('should add new parameter with generated name', () => {
      const builder = new Builder();
      const generatedParameterName = builder.addParameter('test');
      const parameters = builder.buildQueryObject();
      expect(parameters.parameters[generatedParameterName]).toBe('test');
    });
    it('should add new parameter with provided name', () => {
      const builder = new Builder();
      const generatedParameterName = builder.addParameter('test', 'test');
      const parameters = builder.buildQueryObject();
      expect(generatedParameterName).toBeInstanceOf(Builder);
      expect(parameters.parameters.test).toBe('test');
    });
    it('should replace existing parameter if name is the same', () => {
      const builder = new Builder();
      builder.addParameter('test', 'test');
      builder.addParameter('test2', 'test');
      const parameters = builder.buildQueryObject();
      expect(parameters.parameters.test).toBe('test2');
    });
  });
});
