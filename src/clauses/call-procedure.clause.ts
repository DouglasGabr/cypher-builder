import { ShouldBeAdded } from '../types/should-be-added';
import { StringBuilder } from '../types/string-builder';
import { Clause } from './base-clause';

export abstract class CallProcedureClause extends Clause {
  protected procedure: string;
  constructor(procedure: string) {
    super('CALL');
    this.procedure = procedure.trim();
  }
}

export class CallProcedureClauseStringBuilder
  extends CallProcedureClause
  implements StringBuilder, ShouldBeAdded
{
  get __shouldBeAdded() {
    return this.procedure.length > 0;
  }
  build(): string {
    return `${this.prefix} ${this.procedure}`;
  }
}
