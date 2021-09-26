import { StringBuilder } from '../types/string-builder';
import {
  PatternBuilder,
  PatternStringBuilder,
} from '../patterns/PatternBuilder';

export class OptionalMatchClause extends PatternBuilder {}

export class OptionalMatchClauseStringBuilder
  extends PatternStringBuilder
  implements StringBuilder, OptionalMatchClause
{
  build() {
    return 'OPTIONAL MATCH ' + super.build();
  }
}
