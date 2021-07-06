import { StringBuilder } from '../BaseBuilder';

export class UnionClause {
  constructor(protected all?: boolean) {}
}

export class UnionClauseStringBuilder
  extends UnionClause
  implements StringBuilder
{
  build(): string {
    return `UNION${this.all ? ' ALL' : ''}`;
  }
}
