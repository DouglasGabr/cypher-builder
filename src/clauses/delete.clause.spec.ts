import { DeleteClauseStringBuilder } from './delete.clause';

describe('DELETE', () => {
  describe('__shouldBeAdded', () => {
    it('should return false if no item is present', () => {
      const deleteClause = new DeleteClauseStringBuilder(false, []);
      expect(deleteClause.__shouldBeAdded).toBeFalse();
    });
    it('should return true if an item is present', () => {
      const deleteClause = new DeleteClauseStringBuilder(false, ['item']);
      expect(deleteClause.__shouldBeAdded).toBeTrue();
    });
  });
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
