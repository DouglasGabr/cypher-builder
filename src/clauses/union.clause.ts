import { ShouldBeAdded } from '../types/should-be-added';
import { StringBuilder } from '../types/string-builder';
import { Clause } from './base-clause';

export class UnionClause extends Clause {
  constructor(all?: boolean) {
    super(all ? 'UNION ALL' : 'UNION');
  }
}

export class UnionClauseStringBuilder
  extends UnionClause
  implements StringBuilder, ShouldBeAdded
{
  __shouldBeAdded = true;
  build(): string {
    return this.prefix;
  }
}
