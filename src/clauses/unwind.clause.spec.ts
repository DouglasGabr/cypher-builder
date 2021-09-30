import { UnwindClauseStringBuilder } from './unwind.clause';

describe('Unwind Clause', () => {
  it('should unwind literal', () => {
    const clause = new UnwindClauseStringBuilder('literal', 'newLabel');
    const result = clause.build();
    expect(result).toBe('UNWIND literal AS newLabel');
  });
  it('should unwind array as parameter', () => {
    const clause = new UnwindClauseStringBuilder(['one', 'two'], 'newLabel');
    const result = clause.build();
    expect(result).toBe('UNWIND $newLabel AS newLabel');
  });
});
