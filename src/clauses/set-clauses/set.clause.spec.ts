import { SetClauseStringBuilder } from './set.clause';

declare module '../../types/labels-and-properties' {
  export interface CypherBuilderNodes {
    User: { id: string };
    Post: { id: string };
  }
}

describe('SetClause', () => {
  describe('set', () => {
    it('should set field', () => {
      const clause = new SetClauseStringBuilder().set('field', 'newValue');
      const result = clause.build();
      expect(result).toBe('SET field = $field');
    });
    it('should set field using merge operator', () => {
      const clause = new SetClauseStringBuilder().set(
        'field',
        'newValue',
        '+=',
      );
      const result = clause.build();
      expect(result).toBe('SET field += $field');
    });
  });
  describe('setLiteral', () => {
    it('should set field with literal', () => {
      const clause = new SetClauseStringBuilder().setLiteral(
        'field',
        'newValue',
      );
      const result = clause.build();
      expect(result).toBe('SET field = newValue');
    });
    it('should set field with literal using merge operator', () => {
      const clause = new SetClauseStringBuilder().setLiteral(
        'field',
        'newValue',
        '+=',
      );
      const result = clause.build();
      expect(result).toBe('SET field += newValue');
    });
  });

  describe('setLabels', () => {
    it('should set one label', () => {
      const clause = new SetClauseStringBuilder().setLabels('post', 'Post');
      const result = clause.build();
      expect(result).toBe('SET post:Post');
    });
    it('should set multiple labels', () => {
      const clause = new SetClauseStringBuilder().setLabels('node', [
        'Post',
        'User',
      ]);
      const result = clause.build();
      expect(result).toBe('SET node:Post:User');
    });
  });
});
