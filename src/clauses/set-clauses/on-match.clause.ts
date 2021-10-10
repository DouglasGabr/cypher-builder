import { ParametersBag } from '../../parameters/ParametersBag';
import { SetClauseStringBuilder } from './set.clause';

export class OnMatchClauseStringBuilder extends SetClauseStringBuilder {
  constructor(parametersBag: ParametersBag) {
    super('ON MATCH SET', parametersBag);
  }
}
