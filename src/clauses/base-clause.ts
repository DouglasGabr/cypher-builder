import { ParametersBag } from '../parameters/ParametersBag';

type ClausePrefix =
  | 'MATCH'
  | 'MERGE'
  | 'WHERE'
  | 'RETURN'
  | 'SKIP'
  | 'LIMIT'
  | 'WITH';

export abstract class BaseClause {
  constructor(
    protected prefix: ClausePrefix,
    protected parametersBag: ParametersBag,
  ) {}
}
