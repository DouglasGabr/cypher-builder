import { OrderByClauseStringBuilder } from './order-by.clause';

describe('ORDER BY', () => {
  it('should create ORDER BY clause', () => {
    const builder = new OrderByClauseStringBuilder(['order.field']);
    const result = builder.build();
    expect(result).toBe('ORDER BY order.field');
  });
  it('should build multi item ORDER BY', () => {
    const builder = new OrderByClauseStringBuilder(['order.field', 'other']);
    const result = builder.build();
    expect(result).toBe('ORDER BY order.field, other');
  });
  it('should build ORDER BY with ordering', () => {
    const builder = new OrderByClauseStringBuilder([
      ['order.field', 'DESC'],
      'other',
    ]);
    const result = builder.build();
    expect(result).toBe('ORDER BY order.field DESC, other');
  });
});
