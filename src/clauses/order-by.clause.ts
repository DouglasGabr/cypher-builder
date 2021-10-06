import { StringBuilder } from '../types/string-builder';

export type OrderDirection = 'ASC' | 'DESC' | 'asc' | 'desc';

export type OrderItem = string | [field: string, direction: OrderDirection];

export abstract class OrderByClause {
  constructor(protected items: OrderItem[]) {}
}

export class OrderByClauseStringBuilder
  extends OrderByClause
  implements StringBuilder
{
  build(): string {
    return `ORDER BY ${this.items
      .map((item) =>
        typeof item === 'string' ? item : `${item[0]} ${item[1].toUpperCase()}`,
      )
      .join(', ')}`;
  }
}
