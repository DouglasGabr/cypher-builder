import { PatternStringBuilder } from '../patterns/PatternBuilder';
import { MatchClauseStringBuilder } from './match.clause';

jest.mock('../patterns/PatternBuilder');
const MockedPatternStringBuilder = PatternStringBuilder as jest.MockedClass<
  typeof PatternStringBuilder
>;

const patternBuildResult = '(a)-[:REL]->(b)';
MockedPatternStringBuilder.prototype.build.mockReturnValue(patternBuildResult);

describe('MatchClause', () => {
  it('should build MATCH', () => {
    const matchClauseBuilder = new MatchClauseStringBuilder();
    expect(matchClauseBuilder.build()).toBe(`MATCH ${patternBuildResult}`);
  });
});
