import { ParametersBag } from '../parameters/ParametersBag';
import { PatternStringBuilder } from '../patterns/PatternBuilder';
import { OptionalMatchClauseStringBuilder } from './optional-match.clause';

describe('OPTIONAL MATCH', () => {
  it('should build OPTIONAL MATCH clause', () => {
    const patternBuilder = new PatternStringBuilder(new ParametersBag());
    patternBuilder.node().relationship().node();
    const builder = new OptionalMatchClauseStringBuilder(patternBuilder);
    const result = builder.build();
    expect(result).toBe('OPTIONAL MATCH ()--()');
  });
});
