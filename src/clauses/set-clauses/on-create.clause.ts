import { StringBuilder } from '../../types/string-builder';
import { SetClause, SetClauseStringBuilder } from './set.clause';

export class OnCreateClause extends SetClause {}

export class OnCreateClauseStringBuilder
  extends SetClauseStringBuilder
  implements OnCreateClause, StringBuilder
{
  build(): string {
    return 'ON CREATE ' + super.build();
  }
}
