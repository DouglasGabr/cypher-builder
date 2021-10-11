import { ParametersBag } from '../parameters/ParametersBag';
import { literal } from '../utils/literal';
import { PatternStringBuilder } from './PatternBuilder';

declare module '../types/labels-and-properties' {
  export interface CypherBuilderNodes {
    User: { id: string };
    Post: { id: string };
  }
}

describe('PatternBuilder', () => {
  describe('nodes', () => {
    it('should build node with only properties', () => {
      const builder = new PatternStringBuilder(new ParametersBag());
      builder.node(undefined, undefined, { id: 'test' });
      expect(builder.build()).toBe('({ id: $id })');
    });
    it('should build a node with literal property', () => {
      const builder = new PatternStringBuilder(new ParametersBag());
      builder.node('user', 'User', { id: literal('literal.id') });
      expect(builder.build()).toBe('(user:User{ id: literal.id })');
    });
  });
});
