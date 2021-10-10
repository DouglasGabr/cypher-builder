import { ParametersBag } from '../../parameters/ParametersBag';
import { ShouldBeAdded } from '../../types/should-be-added';
import { StringBuilder } from '../../types/string-builder';
import { Clause } from '../base-clause';

export class SkipClause extends Clause {
  protected skipParam: string;
  constructor(parametersBag: ParametersBag, skip: number) {
    super('SKIP');
    this.skipParam = parametersBag.add(skip, true, 'skip');
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
