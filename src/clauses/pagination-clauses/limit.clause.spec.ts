import { ParametersBag } from '../../parameters/ParametersBag';
import { LimitClauseStringBuilder } from './limit.clause';

describe('LimitClause', () => {
  it('should build limit clause', () => {
    const clause = new LimitClauseStringBuilder(new ParametersBag(), 10);
    const result = clause.build();
    expect(result).toBe('LIMIT $limit');
  });
});
