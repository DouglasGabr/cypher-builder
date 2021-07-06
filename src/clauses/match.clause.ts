import { StringBuilder } from '../BaseBuilder';
import { ParametersBag } from '../parameters/ParametersBag';
import {
  PatternBuilder,
  PatternStringBuilder,
} from '../patterns/PatternBuilder';

export class MatchClause extends PatternBuilder {}

export class MatchClauseStringBuilder
  extends PatternStringBuilder
  implements StringBuilder, MatchClause
{
  build() {
    return 'MATCH ' + super.build();
  }
}
