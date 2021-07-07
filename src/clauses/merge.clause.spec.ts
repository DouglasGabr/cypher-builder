import { PatternStringBuilder } from '../patterns/PatternBuilder';
import { MergeClauseStringBuilder } from './merge.clause';

jest.mock('../patterns/PatternBuilder');
const MockedPatternStringBuilder = PatternStringBuilder as jest.MockedClass<
  typeof PatternStringBuilder
>;

const patternBuildResult = '(a)-[:REL]->(b)';
MockedPatternStringBuilder.prototype.build.mockReturnValue(patternBuildResult);

describe('MergeClause', () => {
  it('should build MERGE', () => {
    const mergeClauseBuilder = new MergeClauseStringBuilder();
    expect(mergeClauseBuilder.build()).toBe(`MERGE ${patternBuildResult}`);
  });
});
