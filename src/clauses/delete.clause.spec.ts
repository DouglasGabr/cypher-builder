import { DeleteClauseStringBuilder } from './delete.clause';

describe('DELETE', () => {
  it('should build DELETE clause', () => {
    const builder = new DeleteClauseStringBuilder(false, ['item1', 'item2']);
    const result = builder.build();
    expect(result).toBe('DELETE item1, item2');
  });
  describe('DETACH DELETE', () => {
    it('should build DETACH DELETE clause', () => {
      const builder = new DeleteClauseStringBuilder(true, ['item1', 'item2']);
      const result = builder.build();
      expect(result).toBe('DETACH DELETE item1, item2');
    });
  });
});
