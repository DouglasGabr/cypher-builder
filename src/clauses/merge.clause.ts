import { StringBuilder } from '../types/string-builder';
import {
  PatternBuilder,
  PatternStringBuilder,
} from '../patterns/PatternBuilder';
import { Clause } from './base-clause';
import { ShouldBeAdded } from '../types/should-be-added';

export class MergeClause extends Clause {
  constructor(protected patternBuilder: PatternBuilder) {
    super('MERGE');
  }
}

export class MergeClauseStringBuilder
  extends MergeClause
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
