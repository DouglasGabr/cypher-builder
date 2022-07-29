import { ParametersBag } from '../parameters/ParametersBag';
import { literal } from '../utils/literal';
import { PatternStringBuilder } from './PatternBuilder';

declare module '../types/labels-and-properties' {
  export interface CypherBuilderNodes {
    User: { id: string };
    Post: { id: string };
  }
  export interface CypherBuilderRelationships {
    PURCHASES: Record<string, never>;
    IS_FRIEND: {
      since: number;
    };
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
    it('should build a relationship with properties', () => {
      const builder = new PatternStringBuilder(new ParametersBag());
      builder
        .node()
        .relationship('either', undefined, 'friend', undefined, {
          since: 2010,
        })
        .node();
      expect(builder.build()).toBe('()-[friend { since: $friend_since }]-()');
    });
  });
  describe('path variable', () => {
    it('should build a path with variable', () => {
      const builder = new PatternStringBuilder(new ParametersBag(), 'p')
        .node('a')
        .relationship()
        .node('b');

      expect(builder.build()).toBe('p = (a)--(b)');
    });
  });
});
