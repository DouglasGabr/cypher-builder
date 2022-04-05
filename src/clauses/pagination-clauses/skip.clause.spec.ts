import { types } from 'neo4j-driver';
import { ParametersBag } from '../../parameters/ParametersBag';
import { SkipClauseStringBuilder } from './skip.clause';

describe('SkipClause', () => {
  it('should build skip clause', () => {
    const clause = new SkipClauseStringBuilder(new ParametersBag(), 10);
    const result = clause.build();
    expect(result).toBe('SKIP $skip');
  });
  it('should save skip parameter as Integer', () => {
    const parametersBag = new ParametersBag();
    new SkipClauseStringBuilder(parametersBag, 10);
    expect(parametersBag.toParametersObject()).toEqual({
      skip: expect.any(types.Integer),
    });
  });
});
