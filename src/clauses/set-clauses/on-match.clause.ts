import { ParametersBag } from '../../parameters/ParametersBag';
import { Variables } from '../../utils/variable-types';
import { SetClauseStringBuilder } from './set.clause';

export class OnMatchClauseStringBuilder<
  TVariables extends Variables,
> extends SetClauseStringBuilder<TVariables> {
  constructor(parametersBag: ParametersBag) {
    super('ON MATCH SET', parametersBag);
  }
}
