import { StringBuilder } from '../../types/string-builder';

export abstract class PlannerHintClause {
  protected value: string;
  constructor(
    protected hint:
      | 'INDEX'
      | 'INDEX SEEK'
      | 'SCAN'
      | 'JOIN ON'
      | 'PERIODIC COMMIT',
    value: StringBuilder | string,
  ) {
    this.value = typeof value === 'string' ? value : value.build();
  }
}

export abstract class PlannerHintClauseStringBuilder
  extends PlannerHintClause
  implements StringBuilder
{
  build(): string {
    return `USING ${this.hint} ${this.value}`.trim();
  }
}
