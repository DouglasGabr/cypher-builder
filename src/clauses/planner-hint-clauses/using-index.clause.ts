import { ShouldBeAdded } from '../../types/should-be-added';
import { StringBuilder } from '../../types/string-builder';
import { PlannerHintClauseStringBuilder } from './planner-hint.clause';

class UsingIndexValueBuilder implements StringBuilder {
  constructor(
    private variable: string,
    private label: string,
    private fields: string[],
  ) {}
  build(): string {
    return `${this.variable}:${this.label}(${this.fields.join(', ')})`;
  }
}

export class UsingIndexClauseStringBuilder
  extends PlannerHintClauseStringBuilder
  implements StringBuilder, ShouldBeAdded
{
  __shouldBeAdded = true;
  constructor(variable: string, label: string, fields: string[]) {
    super('USING INDEX', new UsingIndexValueBuilder(variable, label, fields));
  }
}
