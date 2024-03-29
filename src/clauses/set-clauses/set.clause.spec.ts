import { literal } from '../..';
import { ParametersBag } from '../../parameters/ParametersBag';
import { SetClauseStringBuilder } from './set.clause';

describe('SetClause', () => {
  describe('set', () => {
    it('should set field', () => {
      const clause = new SetClauseStringBuilder('SET', new ParametersBag()).set(
        'field',
        'newValue',
      );
      const result = clause.build();
      expect(result).toBe('SET field = $field');
    });
    it('should set field using merge operator', () => {
      const clause = new SetClauseStringBuilder('SET', new ParametersBag()).set(
        'field',
        'newValue',
        '+=',
      );
      const result = clause.build();
      expect(result).toBe('SET field += $field');
    });
  });
  describe('literals', () => {
    it('should set field with literal', () => {
      const clause = new SetClauseStringBuilder('SET', new ParametersBag()).set(
        'field',
        literal('newValue'),
      );
      const result = clause.build();
      expect(result).toBe('SET field = newValue');
    });
    it('should set field with literal using merge operator', () => {
      const clause = new SetClauseStringBuilder('SET', new ParametersBag()).set(
        'field',
        literal('newValue'),
        '+=',
      );
      const result = clause.build();
      expect(result).toBe('SET field += newValue');
    });
  });

  describe('setLabels', () => {
    it('should set one label', () => {
      const clause = new SetClauseStringBuilder(
        'SET',
        new ParametersBag(),
      ).setLabels('post', 'Post');
      const result = clause.build();
      expect(result).toBe('SET post:Post');
    });
    it('should set multiple labels', () => {
      const clause = new SetClauseStringBuilder(
        'SET',
        new ParametersBag(),
      ).setLabels('node', ['Post', 'User']);
      const result = clause.build();
      expect(result).toBe('SET node:Post:User');
    });
  });
});
