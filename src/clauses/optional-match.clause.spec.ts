import { OptionalMatchClauseStringBuilder } from './optional-match.clause';

describe('OPTIONAL MATCH', () => {
  it('should build OPTIONAL MATCH clause', () => {
    const builder = new OptionalMatchClauseStringBuilder();
    builder.node().relationship().node();
    const result = builder.build();
    expect(result).toBe('OPTIONAL MATCH ()--()');
  });
});
