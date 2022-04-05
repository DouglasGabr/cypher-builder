import { ParametersBag } from '../../parameters/ParametersBag';
import { ShouldBeAdded } from '../../types/should-be-added';
import { StringBuilder } from '../../types/string-builder';
import { Clause } from '../base-clause';
import neo4j from 'neo4j-driver';

export class SkipClause extends Clause {
  protected skipParam: string;
  constructor(parametersBag: ParametersBag, skip: number) {
    super('SKIP');
    this.skipParam = parametersBag.add(neo4j.int(skip), true, 'skip');
  }
}

export class SkipClauseStringBuilder
  extends SkipClause
  implements StringBuilder, ShouldBeAdded
{
  __shouldBeAdded = true;
  build(): string {
    return `${this.prefix} ${this.skipParam}`;
  }
}
