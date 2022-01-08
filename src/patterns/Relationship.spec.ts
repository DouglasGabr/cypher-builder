import { Relationship } from './Relationship';

describe('Relationship', () => {
  describe('directions', () => {
    it('should build "in" relationship', () => {
      const relationship = new Relationship('in');
      expect(relationship.build()).toBe('<--');
    });
    it('should build "out" relationship', () => {
      const relationship = new Relationship('out');
      expect(relationship.build()).toBe('-->');
    });
    it('should build "either" relationship', () => {
      const relationship = new Relationship();
      expect(relationship.build()).toBe('--');
    });
  });
  describe('alias', () => {
    it('should build relationship with alias', () => {
      const relationship = new Relationship('either', 'r');
      expect(relationship.build()).toBe('-[r]-');
    });
  });
  describe('types', () => {
    it('should build relationship with one type', () => {
      const relationship = new Relationship('either', undefined, ['Test']);
      expect(relationship.build()).toBe('-[:Test]-');
    });
    it('should build relationship with multiple types', () => {
      const relationship = new Relationship('either', undefined, [
        'Test',
        'Test2',
      ]);
      expect(relationship.build()).toBe('-[:Test|Test2]-');
    });
  });
  describe('properties', () => {
    it('should build relationship with properties', () => {
      const relationship = new Relationship('either', undefined, undefined, {
        test: '$test',
      });
      expect(relationship.build()).toBe('-[ { test: $test }]-');
    });
  });
  describe('limits', () => {
    it('should build relationship with * limit', () => {
      const relationship = new Relationship(
        'either',
        undefined,
        undefined,
        undefined,
        '*',
      );
      expect(relationship.build()).toBe('-[*]-');
    });
    it('should build relationship with start limit', () => {
      const relationship = new Relationship(
        'either',
        undefined,
        undefined,
        undefined,
        5,
      );
      expect(relationship.build()).toBe('-[*5]-');
    });
    it('should build relationship with start and end limit', () => {
      const relationship = new Relationship(
        'either',
        undefined,
        undefined,
        undefined,
        [5, 10],
      );
      expect(relationship.build()).toBe('-[*5..10]-');
    });
    it('should build relationship with start and no end limit', () => {
      const relationship = new Relationship(
        'either',
        undefined,
        undefined,
        undefined,
        [5],
      );
      expect(relationship.build()).toBe('-[*5..]-');
    });
    it('should build relationship with no start, but with end limit', () => {
      const relationship = new Relationship(
        'either',
        undefined,
        undefined,
        undefined,
        [null, 10],
      );
      expect(relationship.build()).toBe('-[*..10]-');
    });
  });
  it('should build full relationship with all options', () => {
    const relationship = new Relationship(
      'out',
      'alias',
      ['Test', 'Test2'],
      {
        test: '$test',
      },
      [5, 10],
    );
    expect(relationship.build()).toBe(
      '-[alias:Test|Test2*5..10 { test: $test }]->',
    );
  });
});
