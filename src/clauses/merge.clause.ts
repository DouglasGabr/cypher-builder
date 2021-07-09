import { StringBuilder } from '../types/string-builder';
import {
  PatternBuilder,
  PatternStringBuilder,
} from '../patterns/PatternBuilder';

export class MergeClause extends PatternBuilder {}

export class MergeClauseStringBuilder
  extends PatternStringBuilder
  implements StringBuilder, MergeClause
{
  build() {
    return 'MERGE ' + super.build();
  }
}
