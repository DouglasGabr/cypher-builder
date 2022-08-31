import { Builder } from '..';
import { CallClauseStringBuilder } from './call.clause';

describe('CALL', () => {
  it('should build CALL clause', () => {
    // arrange
    const internalBuilder = new Builder();
    // @ts-expect-error - private field
    internalBuilder.indent = 2;
    internalBuilder.match((m) => m.node('a').relationship('out').node('b'));
    const callClause = new CallClauseStringBuilder(internalBuilder);
    // act
    const result = callClause.build();
    // assert
    expect(result).toEqual('CALL {\n  MATCH (a)-->(b)\n}');
  });
});
