import { ParametersBag } from '../../parameters/ParametersBag';
import { SkipClauseStringBuilder } from './skip.clause';

describe('SkipClause', () => {
  it('should build skip clause', () => {
    const clause = new SkipClauseStringBuilder(new ParametersBag(), 10);
    const result = clause.build();
    expect(result).toBe('SKIP $skip');
  });
});
