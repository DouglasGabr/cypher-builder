import { ShouldBeAdded } from '../../types/should-be-added';
import { StringBuilder } from '../../types/string-builder';
import { PlannerHintClauseStringBuilder } from './planner-hint.clause';

class UsingScanValueBuilder implements StringBuilder {
  constructor(private variable: string, private label: string) {}
  build(): string {
    return `${this.variable}:${this.label}`;
  }
}

export class UsingScanClauseStringBuilder
  extends PlannerHintClauseStringBuilder
  implements StringBuilder, ShouldBeAdded
{
  __shouldBeAdded = true;
  constructor(variable: string, label: string) {
    super('USING SCAN', new UsingScanValueBuilder(variable, label));
  }
}
