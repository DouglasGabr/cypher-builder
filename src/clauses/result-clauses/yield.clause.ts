import { StringBuilder } from '../../types/string-builder';
import { ResultClause, ResultClauseStringBuilder } from './result.clause';

export abstract class YieldClause extends ResultClause {
  constructor() {
    super('YIELD', false);
  }
}

export class YieldClauseStringBuilder
  extends ResultClauseStringBuilder
  implements StringBuilder
{
  constructor() {
    super('YIELD', false);
  }
}
