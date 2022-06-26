import { Builder } from './index';
import neo4j from 'neo4j-driver';

declare module './types/labels-and-properties' {
  export interface CypherBuilderNodes {
    User: { id: string };
    Post: { id: string; title: string };
  }
  export interface CypherBuilderRelationships {
    PURCHASES: {};
    IS_FRIEND: {
      since: number;
    };
    PUBLISHED: {
      id: string;
      date: typeof neo4j.types.DateTime;
    };
  }
}

describe('Builder', () => {
  describe('MATCH', () => {
    describe('path variable', () => {
      it('should work with path variable', () => {
        // arrange
        const builder = new Builder();
        builder.match('p', (m) => m.node('a').relationship().node('b'));
        // act
        const result = builder.build();
        // assert
        expect(result).toBe('MATCH p = (a)--(b)');
      });
    });
  });
  describe('addParameter', () => {
    it('should add new parameter with generated name', () => {
      const builder = new Builder();
      const generatedParameterName = builder.addParameter('test');
      const parameters = builder.buildQueryObject();
      expect(parameters.parameters[generatedParameterName]).toBe('test');
    });
    it('should add new parameter with provided name', () => {
      const builder = new Builder();
      const generatedParameterName = builder.addParameter('test', 'test');
      const parameters = builder.buildQueryObject();
      expect(generatedParameterName).toBeInstanceOf(Builder);
      expect(parameters.parameters.test).toBe('test');
    });
    it('should replace existing parameter if name is the same', () => {
      const builder = new Builder();
      builder.addParameter('test', 'test');
      builder.addParameter('test2', 'test');
      const parameters = builder.buildQueryObject();
      expect(parameters.parameters.test).toBe('test2');
    });
  });
  describe('CALL', () => {
    it('should work with parameters', () => {
      // arrange
      const builder = new Builder()
        .match((m) => {
          m.node('a', 'User', { id: '1' });
        })
        .call((b) => {
          b.with('a')
            .match((m) => {
              m.node('a').relationship().node('b', 'User', { id: '2' });
            })
            .return('b');
        })
        .return('a', 'b');
      // act
      const result = builder.buildQueryObject();
      // assert
      expect(result.query).toBe(
        'MATCH (a:User{ id: $a_id })\n' +
          'CALL {\n' +
          '  WITH a\n' +
          '  MATCH (a)--(b:User{ id: $b_id })\n' +
          '  RETURN b\n' +
          '}\n' +
          'RETURN a, b',
      );
      expect(result.parameters).toEqual({
        a_id: '1',
        b_id: '2',
      });
    });
    describe('IN TRANSACTIONS', () => {
      it('should work without specifying row count', () => {
        // arrange
        const builder = new Builder();
        // act
        builder.callInTransactions((b) => {
          b.match((m) => {
            m.node('a', 'User', { id: '1' });
          });
        });
        const result = builder.buildQueryObject();
        // assert
        expect(result.query).toBe(
          'CALL {\n' + '  MATCH (a:User{ id: $a_id })\n' + '} IN TRANSACTIONS',
        );
      });
      it('should work specifying row count', () => {
        // arrange
        const builder = new Builder();
        // act
        builder.callInTransactions(5, (b) => {
          b.match((m) => {
            m.node('a', 'User', { id: '1' });
          });
        });
        const result = builder.buildQueryObject();
        // assert
        expect(result.query).toBe(
          'CALL {\n' +
            '  MATCH (a:User{ id: $a_id })\n' +
            '} IN TRANSACTIONS OF 5 ROWS',
        );
      });
    });
  });
  describe('USING INDEX', () => {
    it('should build normally using node index hint', () => {
      // arrange
      const builder = new Builder();
      // act
      builder.usingIndex('user', 'User', ['id']);
      const result = builder.build();
      // assert
      expect(result).toBe('USING INDEX user:User(id)');
    });
    it('should build hint with composite index', () => {
      // arrange
      const builder = new Builder();
      // act
      builder.usingIndex('post', 'Post', ['id', 'title']);
      const result = builder.build();
      // assert
      expect(result).toBe('USING INDEX post:Post(id, title)');
    });
    it('should work with relationship properties', () => {
      // arrange
      const builder = new Builder();
      // act
      builder.usingIndex('rel', 'PUBLISHED', ['id', 'date']);
      const result = builder.build();
      // assert
      expect(result).toBe('USING INDEX rel:PUBLISHED(id, date)');
    });
  });
  describe('USING SCAN', () => {
    it('should work with node', () => {
      // arrange
      const builder = new Builder();
      // act
      builder.usingScan('user', 'User').usingScan('post', 'Post');
      const result = builder.build();
      // assert
      expect(result).toBe('USING SCAN user:User\nUSING SCAN post:Post');
    });
    it('should work with relationship', () => {
      // arrange
      const builder = new Builder();
      // act
      builder.usingScan('rel', 'PUBLISHED');
      const result = builder.build();
      // assert
      expect(result).toBe('USING SCAN rel:PUBLISHED');
    });
  });
  describe('USING JOIN ON', () => {
    it('should work with node', () => {
      // arrange
      const builder = new Builder();
      // act
      builder.usingJoinOn('user');
      const result = builder.build();
      // assert
      expect(result).toBe('USING JOIN ON user');
    });
  });
  describe('CALL procedure', () => {
    it('should add CALL procedure clause', () => {
      // arrange
      const builder = new Builder();
      // act
      builder.call('dbms.procedures()');
      const result = builder.build();
      // assert
      expect(result).toBe('CALL dbms.procedures()');
    });
  });
  describe('YIELD', () => {
    it('should add YIELD clause', () => {
      // arrange
      const builder = new Builder();
      // act
      builder.yield('a', 'b');
      const result = builder.build();
      // assert
      expect(result).toBe('YIELD a, b');
    });
  });
  describe('run', () => {
    it('should run query with runner function (deprecated)', async () => {
      // arrange
      const builder = new Builder().match((m) => m.node('n'));
      const runner = jest.fn().mockResolvedValue({
        records: [],
      });
      // act
      const result = await builder.run(runner);
      // assert
      expect(result).toEqual({
        records: [],
      });
      const { query, parameters } = builder.buildQueryObject();
      expect(runner).toBeCalledWith(query, parameters);
    });
    it('should run query with runner object (like session and transaction)', async () => {
      // arrange
      const builder = new Builder().match((m) => m.node('n'));
      const runner = {
        run: jest.fn().mockResolvedValue({
          records: [],
        }),
      };
      // act
      const result = await builder.run(runner);
      // assert
      expect(result).toEqual({
        records: [],
      });
      const { query, parameters } = builder.buildQueryObject();
      expect(runner.run).toBeCalledWith(query, parameters);
    });
  });
  describe('interpolate', () => {
    it('should interpolate parameters in query', () => {
      // arrange
      const builder = new Builder().match((m) =>
        m.node('user1', 'User', { id: '1' }),
      );
    });
  });
});
