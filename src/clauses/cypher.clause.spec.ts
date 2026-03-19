import { CypherClauseStringBuilder } from './cypher.clause';

describe('CypherClause', () => {
  it('should build with version and options', () => {
    const clause = new CypherClauseStringBuilder(5, [
      'option1=value',
      'option2=test',
    ]);
    expect(clause.build()).toBe('CYPHER 5 option1=value option2=test');
  });

  it('should build with only version', () => {
    const clause = new CypherClauseStringBuilder(25, []);
    expect(clause.build()).toBe('CYPHER 25');
  });

  it('should build with only options', () => {
    const clause = new CypherClauseStringBuilder(undefined, ['option1=value']);
    expect(clause.build()).toBe('CYPHER option1=value');
  });

  it('should not be added if no version or options', () => {
    const clause = new CypherClauseStringBuilder(undefined, []);
    expect(clause.__shouldBeAdded).toBe(false);
  });

  it('should be added if version is set', () => {
    const clause = new CypherClauseStringBuilder(5, []);
    expect(clause.__shouldBeAdded).toBe(true);
  });

  it('should be added if options are set', () => {
    const clause = new CypherClauseStringBuilder(undefined, ['option1=value']);
    expect(clause.__shouldBeAdded).toBe(true);
  });
});
