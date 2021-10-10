import { ParametersBag } from '../parameters/ParametersBag';
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
  });
});
