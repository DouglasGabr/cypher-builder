import { ShouldBeAdded } from '../types/should-be-added';
import { StringBuilder } from '../types/string-builder';
import { Clause } from './base-clause';

export type OrderByDirection = 'ASC' | 'DESC' | 'asc' | 'desc';

export type OrderByItem = string | [field: string, direction: OrderByDirection];

export abstract class OrderByClause extends Clause {
  constructor(protected items: OrderByItem[]) {
    super('ORDER BY');
  }
}

export class OrderByClauseStringBuilder
  extends OrderByClause
  implements StringBuilder, ShouldBeAdded
{
  get __shouldBeAdded() {
    return this.items.length > 0;
  }
  build(): string {
    return `${this.prefix} ${this.items
      .map((item) =>
        typeof item === 'string' ? item : `${item[0]} ${item[1].toUpperCase()}`,
      )
      .join(', ')}`;
  }
}
