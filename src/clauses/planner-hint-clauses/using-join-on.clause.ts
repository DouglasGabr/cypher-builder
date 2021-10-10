import { StringBuilder } from '../../types/string-builder';
import { PlannerHintClauseStringBuilder } from './planner-hint.clause';

export class UsingJoinOnClauseStringBuilder
  extends PlannerHintClauseStringBuilder
  implements StringBuilder
{
  constructor(variable: string) {
    super('USING JOIN ON', variable);
  }
}
