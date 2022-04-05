import { types } from 'neo4j-driver';
import { ParametersBag } from '../../parameters/ParametersBag';
import { LimitClauseStringBuilder } from './limit.clause';

describe('LimitClause', () => {
  it('should build limit clause', () => {
    const clause = new LimitClauseStringBuilder(new ParametersBag(), 10);
    const result = clause.build();
    expect(result).toBe('LIMIT $limit');
  });
  it('should save limit parameter as Integer', () => {
    const parametersBag = new ParametersBag();
    new LimitClauseStringBuilder(parametersBag, 10);
    expect(parametersBag.toParametersObject()).toEqual({
      limit: expect.any(types.Integer),
    });
  });
});
