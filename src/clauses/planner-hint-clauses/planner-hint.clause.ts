import { StringBuilder } from '../../types/string-builder';
import { Clause } from '../base-clause';

type PlannerHintPrefix =
  | 'USING INDEX'
  | 'USING INDEX SEEK'
  | 'USING SCAN'
  | 'USING JOIN ON'
  | 'USING PERIODIC COMMIT';

export abstract class PlannerHintClause extends Clause {
  protected value: string;
  constructor(prefix: PlannerHintPrefix, value: StringBuilder | string) {
    super(prefix);
    this.value = typeof value === 'string' ? value : value.build();
  }
}

export abstract class PlannerHintClauseStringBuilder
  extends PlannerHintClause
  implements StringBuilder
{
  build(): string {
    return `${this.prefix} ${this.value}`.trim();
  }
}
