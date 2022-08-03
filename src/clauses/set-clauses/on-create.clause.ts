import { ParametersBag } from '../../parameters/ParametersBag';
import { Variables } from '../../utils/variable-types';
import { SetClauseStringBuilder } from './set.clause';

export class OnCreateClauseStringBuilder<
  TVariables extends Variables,
> extends SetClauseStringBuilder<TVariables> {
  constructor(parametersBag: ParametersBag) {
    super('ON CREATE SET', parametersBag);
  }
}
