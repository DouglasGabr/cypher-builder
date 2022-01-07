import { ParametersBag } from '../parameters/ParametersBag';
import { PatternStringBuilder } from '../patterns/PatternBuilder';
import { MatchClauseStringBuilder } from './match.clause';

describe('MatchClause', () => {
  it('should build MATCH', () => {
    const patternBuildResult = '(a)-[:REL]->(b)';
    const patternBuilder = new PatternStringBuilder(new ParametersBag());
    jest.spyOn(patternBuilder, 'build').mockReturnValue(patternBuildResult);
    const matchClauseBuilder = new MatchClauseStringBuilder(patternBuilder);
    expect(matchClauseBuilder.build()).toBe(`MATCH ${patternBuildResult}`);
  });
  describe('__shouldBeAdded', () => {
    it('should return true if pattern contain items', () => {
      const patternBuilder = new PatternStringBuilder(new ParametersBag());
      patternBuilder.node('item');
      const matchClauseBuilder = new MatchClauseStringBuilder(patternBuilder);
      expect(matchClauseBuilder.__shouldBeAdded).toBeTrue();
    });
    it('should return false if pattern is empty', () => {
      const patternBuilder = new PatternStringBuilder(new ParametersBag());
      const matchClauseBuilder = new MatchClauseStringBuilder(patternBuilder);
      expect(matchClauseBuilder.__shouldBeAdded).toBeFalse();
    });
  });
});
