import { Builder } from './index';
import neo4j from 'neo4j-driver';

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
  });
  describe('interpolate', () => {
    it('should interpolate parameters in query', () => {
      // arrange
      const datetime = '2022-04-20T13:42:55Z';
      const builder = new Builder()
        .match((m) => m.node('user1', 'User', { id: '1' }))
        .where((w) => {
          w.or('user1.id', 'IN', [1, 2, 3])
            .or(
              'user1.createdAt',
              '>=',
              neo4j.types.DateTime.fromStandardDate(new Date(datetime)),
            )
            .or('user1.awake', true);
        })
        .set((s) => s.set('user1', { id: '2' }));
      // act
      const query = builder.interpolate();
      // assert
      expect(query).toBe(
        'MATCH (user1:User{ id: "1" })\n' +
          'WHERE user1.id IN [1, 2, 3]' +
          ' OR user1.createdAt >= datetime("2022-04-20T13:42:55Z")' +
          ' OR user1.awake = true\n' +
          'SET user1 = { id: "2" }',
      );
    });
  });
});
