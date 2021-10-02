import { OnCreateClauseStringBuilder } from './on-create.clause';

describe('ON CREATE clause', () => {
  it('should build ON CREATE clause', () => {
    const builder = new OnCreateClauseStringBuilder().set('test', 'test');
    const result = builder.build();
    expect(result).toStartWith('ON CREATE SET');
  });
});
