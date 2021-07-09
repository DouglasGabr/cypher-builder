import { StringBuilder } from '../../BaseBuilder';
import { ResultClause, ResultClauseStringBuilder } from './result.clause';

export class ReturnClause extends ResultClause {
  constructor() {
    super('RETURN');
  }
}

export class ReturnClauseStringBuilder
  extends ResultClauseStringBuilder
  implements StringBuilder
{
  constructor() {
    super('RETURN');
  }
}
