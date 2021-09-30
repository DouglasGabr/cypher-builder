import { ParametersBag } from '../parameters/ParametersBag';
import { StringBuilder } from '../types/string-builder';

export class UnwindClause {
  protected list: string;
  constructor(
    list: Array<unknown> | string,
    protected as: string,
    private parametersBag: ParametersBag = new ParametersBag(),
  ) {
    if (Array.isArray(list)) {
      this.list = this.parametersBag.add(list, true, as);
    } else {
      this.list = list;
    }
  }
}

export class UnwindClauseStringBuilder
  extends UnwindClause
  implements StringBuilder
{
  build(): string {
    return `UNWIND ${this.list} AS ${this.as}`;
  }
}
