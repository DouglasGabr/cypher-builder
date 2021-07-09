import { ParametersBag } from '../../parameters/ParametersBag';
import { StringBuilder } from '../../types/string-builder';
import { BaseClause } from '../base-clause';

export class SkipClause extends BaseClause {
  protected skipParam: string;
  constructor(protected parametersBag: ParametersBag, skip: number) {
    super('SKIP', parametersBag);
    this.skipParam = parametersBag.add(skip, true);
  }
}

export class SkipClauseStringBuilder
  extends SkipClause
  implements StringBuilder
{
  build(): string {
    return `${this.prefix} ${this.skipParam}`;
  }
}
