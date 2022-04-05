import { ParametersBag } from '../../parameters/ParametersBag';
import { ShouldBeAdded } from '../../types/should-be-added';
import { StringBuilder } from '../../types/string-builder';
import { Clause } from '../base-clause';
import neo4j from 'neo4j-driver';

export class LimitClause extends Clause {
  protected limitParam: string;
  constructor(parametersBag: ParametersBag, limit: number) {
    super('LIMIT');
    this.limitParam = parametersBag.add(neo4j.int(limit), true, 'limit');
  }
}

export class LimitClauseStringBuilder
  extends LimitClause
  implements StringBuilder, ShouldBeAdded
{
  __shouldBeAdded = true;
  build(): string {
    return `${this.prefix} ${this.limitParam}`;
  }
}
