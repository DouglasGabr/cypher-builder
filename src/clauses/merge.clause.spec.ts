import { ParametersBag } from '../parameters/ParametersBag';
import { PatternStringBuilder } from '../patterns/PatternBuilder';
import { MergeClauseStringBuilder } from './merge.clause';

describe('MergeClause', () => {
  it('should build MERGE', () => {
    const patternBuildResult = '(a)-[:REL]->(b)';
    const patternBuilder = new PatternStringBuilder(new ParametersBag());
    jest.spyOn(patternBuilder, 'build').mockReturnValue(patternBuildResult);
    const mergeClauseBuilder = new MergeClauseStringBuilder(patternBuilder);
    expect(mergeClauseBuilder.build()).toBe(`MERGE ${patternBuildResult}`);
  });

  describe('__shouldBeAdded', () => {
    it('should be false if pattern is empty', () => {
      const patternBuilder = new PatternStringBuilder(new ParametersBag());
      const mergeClauseBuilder = new MergeClauseStringBuilder(patternBuilder);
      expect(mergeClauseBuilder.__shouldBeAdded).toBeFalse();
    });
    it('should be true if pattern contain items', () => {
      const patternBuilder = new PatternStringBuilder(new ParametersBag());
      patternBuilder.node('item');
      const mergeClauseBuilder = new MergeClauseStringBuilder(patternBuilder);
      expect(mergeClauseBuilder.__shouldBeAdded).toBeTrue();
    });
  });
});
