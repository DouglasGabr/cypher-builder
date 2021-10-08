import { StringBuilder } from '../types/string-builder';

/**
 * @see [DELETE](https://neo4j.com/docs/cypher-manual/current/clauses/delete/)
 */
export abstract class DeleteClause {
  constructor(protected detach: boolean, protected items: string[]) {}
}

export class DeleteClauseStringBuilder
  extends DeleteClause
  implements StringBuilder
{
  build(): string {
    return `${this.detach ? 'DETACH ' : ''}DELETE ${this.items.join(', ')}`;
  }
}
