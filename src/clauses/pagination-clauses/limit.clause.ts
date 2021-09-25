import { ParametersBag } from '../../parameters/ParametersBag';
import { StringBuilder } from '../../types/string-builder';
import { BaseClause } from '../base-clause';

export class LimitClause extends BaseClause {
  protected limitParam: string;
  constructor(protected parametersBag: ParametersBag, limit: number) {
    super('LIMIT', parametersBag);
    this.limitParam = parametersBag.add(limit, true);
  }
}

export class LimitClauseStringBuilder
  extends LimitClause
  implements StringBuilder
{
  build(): string {
    return `${this.prefix} ${this.limitParam}`;
  }
}
