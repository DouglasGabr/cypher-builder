import { RelationshipDirection } from '../patterns/Relationship';
import { WhereClauseStringBuilder } from './where.clause';

describe('WhereClause', () => {
  it('should create simple where', () => {
    const clause = new WhereClauseStringBuilder(undefined, 'WHERE');
    clause.and('prop1', 'asdf');
    expect(clause.build()).toBe('WHERE prop1 = $param1');
  });
  it('should create where with custom operator', () => {
    const clause = new WhereClauseStringBuilder(undefined, 'WHERE');
    clause.and('prop1', '<>', 'asdf');
    expect(clause.build()).toBe('WHERE prop1 <> $param1');
  });
  it('should create where with nested and', () => {
    const clause = new WhereClauseStringBuilder(undefined, 'WHERE');
    clause
      .and('prop1', 'asdf')
      .andWhere((w) => w.and('prop2', '>', 1).and('prop3', '<', 10));
    expect(clause.build()).toBe(
      'WHERE prop1 = $param1 AND (prop2 > $param2 AND prop3 < $param3)',
    );
  });
  it('should create simple pattern filter', () => {
    const clause = new WhereClauseStringBuilder(undefined, 'WHERE');
    clause.andPattern((b) =>
      b
        .node('user')
        .relationship(RelationshipDirection.Out, 'PURCHASES')
        .node('item'),
    );
    expect(clause.build()).toBe('WHERE (user)-[:PURCHASES]->(item)');
  });
  it('should create complex filter', () => {
    const whereBuilder = new WhereClauseStringBuilder(undefined, 'WHERE');
    whereBuilder
      .and('prop1', '1')
      .andWhere((innerWhere) =>
        innerWhere
          .and('prop2', '<=', 2)
          .andWhere((innerWhere2) =>
            innerWhere2
              .andPattern((pattern) =>
                pattern
                  .node('person')
                  .relationship(RelationshipDirection.Either, 'IS_FRIEND')
                  .node('personB'),
              )
              .and('person.name', '=~', '3'),
          )
          .and('prop4', '<>', 4),
      )
      .and('personB.name', 'CONTAINS', '5')
      .and('prop1', '1');
    expect(whereBuilder.build()).toBe(
      'WHERE prop1 = $param1 AND (prop2 <= $param2 AND ((person)-[:IS_FRIEND]-(personB) AND person.name =~ $param3) AND prop4 <> $param4) AND personB.name CONTAINS $param5 AND prop1 = $param1',
    );
  });
});
