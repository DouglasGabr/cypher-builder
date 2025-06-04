import { CypherBuilderNodes } from '../types/labels-and-properties';
import { ShouldBeAdded } from '../types/should-be-added';
import { StringBuilder } from '../types/string-builder';
import { Clause } from './base-clause';

type Label = keyof CypherBuilderNodes;

export type RemoveItemParameter =
  | string
  | [string, Label]
  | [string, [Label, ...Label[]]];

function removeItemParameterToString(param: RemoveItemParameter): string {
  if (typeof param === 'string') {
    return param;
  } else {
    const [name, labels] = param;
    if (Array.isArray(labels)) {
      return `${name}:${labels.join(':')}`;
    }
    return `${name}:${labels}`;
  }
}

/**
 * @see [REMOVE](https://neo4j.com/docs/cypher-manual/current/clauses/remove/)
 */
export abstract class RemoveClause extends Clause {
  protected items: string[];
  constructor(items: RemoveItemParameter[]) {
    super('REMOVE');
    this.items = items.map(removeItemParameterToString);
  }
}

export class RemoveClauseStringBuilder
  extends RemoveClause
  implements StringBuilder, ShouldBeAdded
{
  get __shouldBeAdded() {
    return this.items.length > 0;
  }

  build(): string {
    return `${this.prefix} ${this.items.join(', ')}`;
  }
}
