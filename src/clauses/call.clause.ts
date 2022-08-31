import { Builder } from '..';
import { ShouldBeAdded } from '../types/should-be-added';
import { StringBuilder } from '../types/string-builder';
import { Clause } from './base-clause';

export class CallClause extends Clause {
  constructor(protected internalBuilder: Builder) {
    super('CALL');
  }
}

export class CallClauseStringBuilder
  extends CallClause
  implements StringBuilder, ShouldBeAdded
{
  get __shouldBeAdded() {
    // @ts-expect-error - this is a private property
    return this.internalBuilder.clauses.length > 0;
  }
  build(): string {
    return `${this.prefix} {\n${this.internalBuilder.build()}\n}`;
  }
}
