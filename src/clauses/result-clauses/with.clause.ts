import { StringBuilder } from '../../types/string-builder';
import { ResultClause, ResultClauseStringBuilder } from './result.clause';

export abstract class WithClause extends ResultClause {
  constructor(distinct?: boolean) {
    super('WITH', distinct);
  }
}

export class WithClauseStringBuilder
  extends ResultClauseStringBuilder
  implements StringBuilder
{
  constructor(distinct?: boolean) {
    super('WITH', distinct);
  }
}
