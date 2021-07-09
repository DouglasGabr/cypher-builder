import { StringBuilder } from '../../types/string-builder';
import { ResultClause, ResultClauseStringBuilder } from './result.clause';

export class ReturnClause extends ResultClause {
  constructor(distinct?: boolean) {
    super('RETURN', distinct);
  }
}

export class ReturnClauseStringBuilder
  extends ResultClauseStringBuilder
  implements StringBuilder
{
  constructor(distinct?: boolean) {
    super('RETURN', distinct);
  }
}
