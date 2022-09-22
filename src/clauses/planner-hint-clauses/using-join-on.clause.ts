import { ShouldBeAdded } from '../../types/should-be-added';
import { StringBuilder } from '../../types/string-builder';
import { PlannerHintClauseStringBuilder } from './planner-hint.clause';

export class UsingJoinOnClauseStringBuilder
  extends PlannerHintClauseStringBuilder
  implements StringBuilder, ShouldBeAdded
{
  __shouldBeAdded = true;
  constructor(variable: string) {
    super('USING JOIN ON', variable);
  }
}
