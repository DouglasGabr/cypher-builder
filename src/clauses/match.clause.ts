import { StringBuilder } from '../types/string-builder';
import {
  PatternBuilder,
  PatternStringBuilder,
} from '../patterns/PatternBuilder';
import { ShouldBeAdded } from '../types/should-be-added';
import { Clause } from './base-clause';

export class MatchClause extends Clause {
  constructor(protected patternBuilder: PatternBuilder) {
    super('MATCH');
  }
}

export class MatchClauseStringBuilder
  extends MatchClause
  implements StringBuilder, ShouldBeAdded
{
  get __shouldBeAdded() {
    return this.patternBuilder.__shouldBeAdded;
  }
  constructor(protected override patternBuilder: PatternStringBuilder) {
    super(patternBuilder);
  }
  build() {
    return `${this.prefix} ${this.patternBuilder.build()}`;
  }
}
