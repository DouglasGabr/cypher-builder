import { RelationshipDirection } from '../patterns/Relationship';
import { WhereClauseStringBuilder } from './where.clause';

declare module '../types/labels-and-properties' {
  export interface CypherBuilderRelationships {
    PURCHASES: Record<string, never>;
    IS_FRIEND: Record<string, never>;
  }
}

describe('WhereClause', () => {
  describe('regular predicates', () => {
    it('should build or', () => {
      const clause = new WhereClauseStringBuilder(undefined, 'WHERE');
      clause.or('name', 'Bob').or('name', 'Alice');
      expect(clause.build()).toBe('WHERE name = $name OR name = $name_2');
    });
    it('should build or not', () => {
      const clause = new WhereClauseStringBuilder(undefined, 'WHERE');
      clause.or('name', 'Bob').orNot('name', 'Alice');
      expect(clause.build()).toBe('WHERE name = $name OR NOT name = $name_2');
    });
  });
  describe('where predicates', () => {
    it('should create or where', () => {
      const clause = new WhereClauseStringBuilder(undefined, 'WHERE');
      clause
        .or('test', 'test')
        .orWhere((w) => w.or('name', 'Bob').orNot('name', 'Alice'));
      expect(clause.build()).toBe(
        'WHERE test = $test OR (name = $name OR NOT name = $name_2)',
      );
    });
    it('should create or not where', () => {
      const clause = new WhereClauseStringBuilder(undefined, 'WHERE');
      clause
        .or('test', 'test')
        .orNotWhere((w) => w.or('name', 'Bob').orNot('name', 'Alice'));
      expect(clause.build()).toBe(
        'WHERE test = $test OR NOT (name = $name OR NOT name = $name_2)',
      );
    });
    it('should create xor where', () => {
      const clause = new WhereClauseStringBuilder(undefined, 'WHERE');
      clause
        .or('test', 'test')
        .xorWhere((w) => w.or('name', 'Bob').orNot('name', 'Alice'));
      expect(clause.build()).toBe(
        'WHERE test = $test XOR (name = $name OR NOT name = $name_2)',
      );
    });
    it('should create xor not where', () => {
      const clause = new WhereClauseStringBuilder(undefined, 'WHERE');
      clause
        .or('test', 'test')
        .xorNotWhere((w) => w.or('name', 'Bob').orNot('name', 'Alice'));
      expect(clause.build()).toBe(
        'WHERE test = $test XOR NOT (name = $name OR NOT name = $name_2)',
      );
    });
  });
  it('should create simple where', () => {
    const clause = new WhereClauseStringBuilder(undefined, 'WHERE');
    clause.and('prop1', 'asdf');
    expect(clause.build()).toBe('WHERE prop1 = $prop1');
  });
  it('should create where with custom operator', () => {
    const clause = new WhereClauseStringBuilder(undefined, 'WHERE');
    clause.and('prop1', '<>', 'asdf');
    expect(clause.build()).toBe('WHERE prop1 <> $prop1');
  });
  it('should create where with null operator', () => {
    const clause = new WhereClauseStringBuilder(undefined, 'WHERE');
    clause.and('prop1', 'IS NULL');
    expect(clause.build()).toBe('WHERE prop1 IS NULL');
  });
  describe('nested where', () => {
    it('should create where with nested and', () => {
      const clause = new WhereClauseStringBuilder(undefined, 'WHERE');
      clause
        .and('prop1', 'asdf')
        .andWhere((w) => w.and('prop2', '>', 1).and('prop3', '<', 10));
      expect(clause.build()).toBe(
        'WHERE prop1 = $prop1 AND (prop2 > $prop2 AND prop3 < $prop3)',
      );
    });
    it('should create where with nested NOT and', () => {
      const clause = new WhereClauseStringBuilder(undefined, 'WHERE');
      clause
        .and('prop1', 'asdf')
        .andNotWhere((w) => w.and('prop2', '>', 1).and('prop3', '<', 10));
      expect(clause.build()).toBe(
        'WHERE prop1 = $prop1 AND NOT (prop2 > $prop2 AND prop3 < $prop3)',
      );
    });
  });
  describe('pattern predicates', () => {
    it('should create pattern filter', () => {
      const clause = new WhereClauseStringBuilder(undefined, 'WHERE');
      clause.andPattern((b) =>
        b
          .node('user')
          .relationship(RelationshipDirection.Out, 'PURCHASES')
          .node('item'),
      );
      expect(clause.build()).toBe('WHERE (user)-[:PURCHASES]->(item)');
    });
    it('should create NOT pattern filter', () => {
      const clause = new WhereClauseStringBuilder(undefined, 'WHERE');
      clause.andNotPattern((b) =>
        b
          .node('user')
          .relationship(RelationshipDirection.Out, 'PURCHASES')
          .node('item'),
      );
      expect(clause.build()).toBe('WHERE NOT (user)-[:PURCHASES]->(item)');
    });
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
      'WHERE prop1 = $prop1 AND (prop2 <= $prop2 AND ((person)-[:IS_FRIEND]-(personB) AND person.name =~ $person_name) AND prop4 <> $prop4) AND personB.name CONTAINS $personB_name AND prop1 = $prop1_2',
    );
  });
  describe('literals', () => {
    it('should build literal where', () => {
      const whereBuilder = new WhereClauseStringBuilder(undefined, 'WHERE');

      whereBuilder
        .andLiteral('field.name', 'other.name')
        .andNotLiteral('field.lastName', 'CONTAINS', 'other.lastName');
      expect(whereBuilder.build()).toBe(
        'WHERE field.name = other.name AND NOT field.lastName CONTAINS other.lastName',
      );
    });
  });
});
