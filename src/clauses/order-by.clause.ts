import { StringBuilder } from '../types/string-builder';

export type OrderByDirection = 'ASC' | 'DESC' | 'asc' | 'desc';

export type OrderByItem = string | [field: string, direction: OrderByDirection];

export abstract class OrderByClause {
  constructor(protected items: OrderByItem[]) {}
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
