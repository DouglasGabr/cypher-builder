import { ParametersBag } from '../../parameters/ParametersBag';
import { SetClauseStringBuilder } from './set.clause';

export class OnCreateClauseStringBuilder extends SetClauseStringBuilder {
  constructor(parametersBag: ParametersBag) {
    super('ON CREATE SET', parametersBag);
  }
}
