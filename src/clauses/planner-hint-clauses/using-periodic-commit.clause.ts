import { StringBuilder } from '../../types/string-builder';
import { PlannerHintClauseStringBuilder } from './planner-hint.clause';

export class UsingPeriodicCommitClauseStringBuilder
  extends PlannerHintClauseStringBuilder
  implements StringBuilder
{
  constructor(rows?: number) {
    super('PERIODIC COMMIT', rows ? rows.toString() : '');
  }
}
