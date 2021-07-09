import { StringBuilder } from '../../BaseBuilder';
import { ResultClause, ResultClauseStringBuilder } from './result.clause';

export class WithClause extends ResultClause {
  constructor() {
    super('WITH');
  }
}

export class WithClauseStringBuilder
  extends ResultClauseStringBuilder
  implements StringBuilder
{
  constructor() {
    super('WITH');
  }
}
