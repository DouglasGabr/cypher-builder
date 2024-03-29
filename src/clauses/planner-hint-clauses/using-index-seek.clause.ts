import { ShouldBeAdded } from '../../types/should-be-added';
import { StringBuilder } from '../../types/string-builder';
import { PlannerHintClauseStringBuilder } from './planner-hint.clause';

class UsingIndexSeekValueBuilder implements StringBuilder {
  constructor(
    private variable: string,
    private label: string,
    private fields: string[],
  ) {}
  build(): string {
    return `${this.variable}:${this.label}(${this.fields.join(', ')})`;
  }
}

export class UsingIndexSeekClauseStringBuilder
  extends PlannerHintClauseStringBuilder
  implements StringBuilder, ShouldBeAdded
{
  __shouldBeAdded = true;
  constructor(variable: string, label: string, fields: string[]) {
    super(
      'USING INDEX SEEK',
      new UsingIndexSeekValueBuilder(variable, label, fields),
    );
  }
}
