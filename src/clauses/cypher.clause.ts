import { ShouldBeAdded } from '../types/should-be-added';
import { StringBuilder } from '../types/string-builder';
import { Clause } from './base-clause';

export type CypherVersion = 5 | 25;

/**
 * @see [Select Cypher Version](https://neo4j.com/docs/cypher-manual/current/queries/select-version/)
 * @see [Query tuning](https://neo4j.com/docs/cypher-manual/current/planning-and-tuning/query-tuning/)
 */
export abstract class CypherClause extends Clause {
  constructor(
    protected version: CypherVersion | undefined,
    protected options: string[],
  ) {
    super('CYPHER');
  }
}

export class CypherClauseStringBuilder
  extends CypherClause
  implements StringBuilder, ShouldBeAdded
{
  get __shouldBeAdded() {
    return this.version != undefined || this.options.length > 0;
  }
  build(): string {
    const version = this.version ? ` ${this.version}` : '';
    const options = this.options.length > 0 ? ` ${this.options.join(' ')}` : '';
    return `${this.prefix}${version}${options}`;
  }
}
