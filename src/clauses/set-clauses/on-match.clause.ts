import { StringBuilder } from '../../types/string-builder';
import { SetClause, SetClauseStringBuilder } from './set.clause';

export class OnMatchClause extends SetClause {}

export class OnMatchClauseStringBuilder
  extends SetClauseStringBuilder
  implements OnMatchClause, StringBuilder
{
  build(): string {
    return 'ON MATCH ' + super.build();
  }
}
