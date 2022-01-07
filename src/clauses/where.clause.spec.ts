import { ParametersBag } from '../parameters/ParametersBag';
import { literal } from '../utils/literal';
import { WhereClauseStringBuilder } from './where.clause';

declare module '../types/labels-and-properties' {
  export interface CypherBuilderNodes {
    User: { id: string };
    Post: { id: string };
  }
  export interface CypherBuilderRelationships {
    PURCHASES: Record<string, never>;
    IS_FRIEND: Record<string, never>;
  }
}

describe('WhereClause', () => {
  describe('regular predicates', () => {
    it('should build or', () => {
      const clause = new WhereClauseStringBuilder(new ParametersBag());
      clause.or('name', 'Bob').or('name', 'Alice');
      expect(clause.build()).toBe('WHERE name = $name OR name = $name_2');
    });
    it('should build or not', () => {
      const clause = new WhereClauseStringBuilder(new ParametersBag());
      clause.or('name', 'Bob').orNot('name', 'Alice');
      expect(clause.build()).toBe('WHERE name = $name OR NOT name = $name_2');
    });
  });
  describe('where predicates', () => {
    it('should create or where', () => {
      const clause = new WhereClauseStringBuilder(new ParametersBag());
      clause
        .or('test', 'test')
        .orWhere((w) => w.or('name', 'Bob').orNot('name', 'Alice'));
      expect(clause.build()).toBe(
        'WHERE test = $test OR (name = $name OR NOT name = $name_2)',
      );
    });
    it('should create or not where', () => {
      const clause = new WhereClauseStringBuilder(new ParametersBag());
      clause
        .or('test', 'test')
        .orNotWhere((w) => w.or('name', 'Bob').orNot('name', 'Alice'));
      expect(clause.build()).toBe(
        'WHERE test = $test OR NOT (name = $name OR NOT name = $name_2)',
      );
    });
    it('should create xor where', () => {
      const clause = new WhereClauseStringBuilder(new ParametersBag());
      clause
        .or('test', 'test')
        .xorWhere((w) => w.or('name', 'Bob').orNot('name', 'Alice'));
      expect(clause.build()).toBe(
        'WHERE test = $test XOR (name = $name OR NOT name = $name_2)',
      );
    });
    it('should create xor not where', () => {
      const clause = new WhereClauseStringBuilder(new ParametersBag());
      clause
        .or('test', 'test')
        .xorNotWhere((w) => w.or('name', 'Bob').orNot('name', 'Alice'));
      expect(clause.build()).toBe(
        'WHERE test = $test XOR NOT (name = $name OR NOT name = $name_2)',
      );
    });
  });
  it('should create simple where', () => {
    const clause = new WhereClauseStringBuilder(new ParametersBag());
    clause.and('prop1', 'asdf');
    expect(clause.build()).toBe('WHERE prop1 = $prop1');
  });
  it('should create where with custom operator', () => {
    const clause = new WhereClauseStringBuilder(new ParametersBag());
    clause.and('prop1', '<>', 'asdf');
    expect(clause.build()).toBe('WHERE prop1 <> $prop1');
  });
  it('should create where with null operator', () => {
    const clause = new WhereClauseStringBuilder(new ParametersBag());
    clause.and('prop1', 'IS NULL');
    expect(clause.build()).toBe('WHERE prop1 IS NULL');
  });
  describe('nested where', () => {
    it('should create where with nested and', () => {
      const clause = new WhereClauseStringBuilder(new ParametersBag());
      clause
        .and('prop1', 'asdf')
        .andWhere((w) => w.and('prop2', '>', 1).and('prop3', '<', 10));
      expect(clause.build()).toBe(
        'WHERE prop1 = $prop1 AND (prop2 > $prop2 AND prop3 < $prop3)',
      );
    });
    it('should create where with nested NOT and', () => {
      const clause = new WhereClauseStringBuilder(new ParametersBag());
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
      const clause = new WhereClauseStringBuilder(new ParametersBag());
      clause.andPattern((b) =>
        b.node('user').relationship('out', 'PURCHASES').node('item'),
      );
      expect(clause.build()).toBe('WHERE (user)-[:PURCHASES]->(item)');
    });
    it('should create NOT pattern filter', () => {
      const clause = new WhereClauseStringBuilder(new ParametersBag());
      clause.andNotPattern((b) =>
        b.node('user').relationship('out', 'PURCHASES').node('item'),
      );
      expect(clause.build()).toBe('WHERE NOT (user)-[:PURCHASES]->(item)');
    });
  });
  it('should create complex filter', () => {
    const whereBuilder = new WhereClauseStringBuilder(
      new ParametersBag(),
      true,
    );
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
                  .relationship('either', 'IS_FRIEND')
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
      const whereBuilder = new WhereClauseStringBuilder(
        new ParametersBag(),
        true,
      );

      whereBuilder
        .and('field.name', literal('other.name'))
        .andNot('field.lastName', 'CONTAINS', literal('other.lastName'));
      expect(whereBuilder.build()).toBe(
        'WHERE field.name = other.name AND NOT field.lastName CONTAINS other.lastName',
      );
    });
  });
  describe('Label predicates', () => {
    describe('and', () => {
      it('should build and WHERE with label predicate', () => {
        const builder = new WhereClauseStringBuilder(new ParametersBag());
        builder.andLabel('node', 'User').andLabel('other', ['Post', 'User']);
        const result = builder.build();
        expect(result).toBe('WHERE node:User AND other:Post:User');
      });
    });
  });
  describe('Function predicates', () => {
    describe.each([
      { functionName: 'All' },
      { functionName: 'Any' },
      { functionName: 'None' },
      { functionName: 'Single' },
    ] as const)('$functionName', ({ functionName }) => {
      it(`should build WHERE with ${functionName} predicate function`, () => {
        const builder = new WhereClauseStringBuilder(new ParametersBag());
        builder[`and${functionName}`]('item', 'list', (w) =>
          w.and('item', '>', 0),
        );
        const result = builder.build();
        expect(result).toBe(
          `WHERE ${functionName.toLowerCase()}(item IN list WHERE item > $item)`,
        );
      });
    });
    describe('exists', () => {
      describe('variable', () => {
        it('should build exists predicate with variable', () => {
          const builder = new WhereClauseStringBuilder(new ParametersBag());
          builder.andExists('item');
          const result = builder.build();
          expect(result).toBe('WHERE exists(item)');
        });
      });
      describe('pattern', () => {
        it('should build exists predicate with pattern', () => {
          const builder = new WhereClauseStringBuilder(new ParametersBag());
          builder.andExists((p) => p.node('n1').relationship('out').node('n2'));
          const result = builder.build();
          expect(result).toBe('WHERE exists((n1)-->(n2))');
        });
      });
    });
    describe('all predicates together', () => {
      it('should build WHERE with all predicate functions', () => {
        const builder = new WhereClauseStringBuilder(new ParametersBag());
        builder
          .andAll('itemAll', 'listAll', (w) => w.and('itemAll', '>', 0))
          .orAny('itemAny', 'listAny', (w) => {
            w.and('itemAny', 'STARTS WITH', 'test');
          })
          .andNotNone('itemNone', 'listNone', (w) => {
            w.and('itemNone', '<', 0);
          })
          .xorNotSingle('itemSingle', 'listSingle', (w) => {
            w.and('itemSingle', 'IS NULL');
          });
        const result = builder.build();
        expect(result).toBe(
          'WHERE all(itemAll IN listAll WHERE itemAll > $itemAll) ' +
            'OR any(itemAny IN listAny WHERE itemAny STARTS WITH $itemAny) ' +
            'AND NOT none(itemNone IN listNone WHERE itemNone < $itemNone) ' +
            'XOR NOT single(itemSingle IN listSingle WHERE itemSingle IS NULL)',
        );
      });
    });
  });
  describe('__shouldBeAdded', () => {
    it('should return true if there are predicates', () => {
      const builder = new WhereClauseStringBuilder(new ParametersBag());
      builder.and('prop', '=', 1);
      expect(builder.__shouldBeAdded).toBeTrue();
    });
    it('should return false if there are no predicates', () => {
      const builder = new WhereClauseStringBuilder(new ParametersBag());
      expect(builder.__shouldBeAdded).toBeFalse();
    });
  });
});
