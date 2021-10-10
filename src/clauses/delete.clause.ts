import { ShouldBeAdded } from '../types/should-be-added';
import { StringBuilder } from '../types/string-builder';
import { Clause } from './base-clause';

/**
 * @see [DELETE](https://neo4j.com/docs/cypher-manual/current/clauses/delete/)
 */
export abstract class DeleteClause extends Clause {
  constructor(detach: boolean, protected items: string[]) {
    super(detach ? 'DETACH DELETE' : 'DELETE');
  }
}

export class DeleteClauseStringBuilder
  extends DeleteClause
  implements StringBuilder, ShouldBeAdded
{
  get __shouldBeAdded() {
    return this.items.length > 0;
  }
  build(): string {
    return `${this.prefix} ${this.items.join(', ')}`;
  }
}
