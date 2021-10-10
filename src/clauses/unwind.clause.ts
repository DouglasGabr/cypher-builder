import { ParametersBag } from '../parameters/ParametersBag';
import { ShouldBeAdded } from '../types/should-be-added';
import { StringBuilder } from '../types/string-builder';
import { Clause } from './base-clause';

export class UnwindClause extends Clause {
  protected list: string;
  constructor(
    list: Array<unknown> | string,
    protected as: string,
    parametersBag: ParametersBag = new ParametersBag(),
  ) {
    super('UNWIND');
    if (Array.isArray(list)) {
      this.list = parametersBag.add(list, true, as);
    } else {
      this.list = list;
    }
  }
}

export class UnwindClauseStringBuilder
  extends UnwindClause
  implements StringBuilder, ShouldBeAdded
{
  __shouldBeAdded = true;
  build(): string {
    return `${this.prefix} ${this.list} AS ${this.as}`;
  }
}
