import { PatternBuilder } from '..';
import { PatternStringBuilder } from '../patterns/PatternBuilder';
import { ShouldBeAdded } from '../types/should-be-added';
import { StringBuilder } from '../types/string-builder';
import { Clause } from './base-clause';

export class CreateClause extends Clause {
  constructor(protected patternBuilder: PatternBuilder) {
    super('CREATE');
  }
}

export class CreateClauseStringBuilder
  extends CreateClause
  implements StringBuilder, ShouldBeAdded
{
  constructor(protected override patternBuilder: PatternStringBuilder) {
    super(patternBuilder);
  }
  get __shouldBeAdded() {
    return this.patternBuilder.__shouldBeAdded;
  }
  build(): string {
    return `${this.prefix} ${this.patternBuilder.build()}`;
  }
}
