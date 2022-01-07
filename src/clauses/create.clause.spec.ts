import { ParametersBag } from '../parameters/ParametersBag';
import { PatternStringBuilder } from '../patterns/PatternBuilder';
import { CreateClauseStringBuilder } from './create.clause';

describe('Create Clause', () => {
  describe('__shouldBeAdded', () => {
    it('should return false if pattern builder is empty', () => {
      const patternBuilder = new PatternStringBuilder(new ParametersBag());
      const createClause = new CreateClauseStringBuilder(patternBuilder);
      expect(createClause.__shouldBeAdded).toBeFalse();
    });
    it('should return true if patter builder contains items', () => {
      const patternBuilder = new PatternStringBuilder(new ParametersBag());
      patternBuilder.node('item');
      const createClause = new CreateClauseStringBuilder(patternBuilder);
      expect(createClause.__shouldBeAdded).toBeTrue();
    });
    it('should build CREATE clause with the pattern provided', () => {
      const patternBuilder = new PatternStringBuilder(new ParametersBag());
      patternBuilder.node('item').relationship().node('other');
      const createClause = new CreateClauseStringBuilder(patternBuilder);
      expect(createClause.build()).toBe('CREATE (item)--(other)');
    });
  });
});
