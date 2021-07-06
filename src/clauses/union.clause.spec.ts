import { UnionClauseStringBuilder } from './union.clause';

describe('UnionClause', () => {
  it.concurrent('should build UNION', () => {
    const clause = new UnionClauseStringBuilder();
    expect(clause.build()).toBe('UNION');
  });

  it.concurrent('should build UNION ALL', () => {
    const clause = new UnionClauseStringBuilder(true);
    expect(clause.build()).toBe('UNION ALL');
  });
});
